package com.techsetu.backend.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.techsetu.backend.model.Document;
import com.techsetu.backend.model.DocumentChunk;
import com.techsetu.backend.repository.DocumentChunkRepository;
import com.techsetu.backend.repository.DocumentRepository;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.*;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    @Value("${app.gemini.api-key:your_gemini_api_key_here}")
    private String systemApiKey;

    private final DocumentRepository documentRepository;
    private final DocumentChunkRepository documentChunkRepository;
    private final org.springframework.data.mongodb.core.MongoTemplate mongoTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public DocumentController(DocumentRepository documentRepository,
                              DocumentChunkRepository documentChunkRepository,
                              org.springframework.data.mongodb.core.MongoTemplate mongoTemplate) {
        this.documentRepository = documentRepository;
        this.documentChunkRepository = documentChunkRepository;
        this.mongoTemplate = mongoTemplate;

        // Ensure Text Index exists on content field of document_chunks for ultra-fast native searches
        try {
            mongoTemplate.indexOps(DocumentChunk.class)
                    .ensureIndex(new org.springframework.data.mongodb.core.index.TextIndexDefinition.TextIndexDefinitionBuilder()
                            .onField("content")
                            .build());
        } catch (Exception e) {
            System.err.println("Failed to ensure MongoDB text index: " + e.getMessage());
        }
    }

    private String getCurrentUserEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @GetMapping
    public List<Document> getDocuments() {
        return documentRepository.findByUserEmailOrderByCreatedAtDesc(getCurrentUserEmail());
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadDocument(@RequestParam("file") MultipartFile file) {
        try {
            String filename = file.getOriginalFilename();
            long fileSize = file.getSize();

            String fullText = "";
            if (filename != null && filename.toLowerCase().endsWith(".pdf")) {
                try (PDDocument doc = Loader.loadPDF(file.getBytes())) {
                    PDFTextStripper stripper = new PDFTextStripper();
                    fullText = stripper.getText(doc);
                }
            } else {
                fullText = new String(file.getBytes(), StandardCharsets.UTF_8);
            }

            if (fullText.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Failed to extract text or document is empty."));
            }

            Document document = new Document(getCurrentUserEmail(), filename, fileSize);
            document.setId(UUID.randomUUID().toString());
            documentRepository.save(document);

            List<DocumentChunk> chunks = new ArrayList<>();
            int chunkSize = 1000;
            int overlap = 200;
            int start = 0;
            int chunkIdx = 0;

            while (start < fullText.length()) {
                int end = Math.min(start + chunkSize, fullText.length());
                String chunkContent = fullText.substring(start, end);
                
                DocumentChunk chunk = new DocumentChunk(document.getId(), chunkIdx++, chunkContent);
                chunk.setId(UUID.randomUUID().toString());
                chunks.add(chunk);

                if (end == fullText.length()) {
                    break;
                }
                start += (chunkSize - overlap);
            }
            documentChunkRepository.saveAll(chunks);

            return ResponseEntity.ok(document);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Document upload failed: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDocument(@PathVariable String id) {
        Document document = documentRepository.findById(id).orElse(null);
        if (document == null || !document.getUserEmail().equals(getCurrentUserEmail())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");
        }
        documentRepository.deleteById(id);
        documentChunkRepository.deleteByDocumentId(id);
        return ResponseEntity.ok().body(Map.of("message", "Document and indexed vector chunks deleted successfully"));
    }

    @PostMapping("/{id}/query")
    public ResponseEntity<?> queryDocument(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            @RequestHeader(value = "X-Gemini-Key", required = false) String clientKey) {

        String apiKey = (clientKey != null && !clientKey.trim().isEmpty()) ? clientKey : systemApiKey;
        if (apiKey == null || apiKey.trim().isEmpty() || "your_gemini_api_key_here".equals(apiKey)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Gemini API Key is not configured. Please supply your key in Settings."));
        }

        Document document = documentRepository.findById(id).orElse(null);
        if (document == null || !document.getUserEmail().equals(getCurrentUserEmail())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");
        }

        String question = body.get("question");
        if (question == null || question.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Question is empty"));
        }

        try {
            // Perform native MongoDB text search (utilizing index matching in milliseconds)
            org.springframework.data.mongodb.core.query.TextQuery textQuery = 
                    org.springframework.data.mongodb.core.query.TextQuery.queryText(
                            org.springframework.data.mongodb.core.query.TextCriteria.forDefaultLanguage().matching(question)
                    ).sortByScore();
            textQuery.addCriteria(org.springframework.data.mongodb.core.query.Criteria.where("documentId").is(id));
            textQuery.limit(3);

            List<DocumentChunk> topChunks = mongoTemplate.find(textQuery, DocumentChunk.class);

            // Fallback: If no indexed match is found, retrieve the first few chunks of the document
            if (topChunks.isEmpty()) {
                List<DocumentChunk> allChunks = documentChunkRepository.findByDocumentId(id);
                if (allChunks.isEmpty()) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("error", "No text indexed for this document."));
                }
                allChunks.sort(Comparator.comparingInt(DocumentChunk::getChunkIndex));
                int limit = Math.min(3, allChunks.size());
                topChunks = allChunks.subList(0, limit);
            }

            StringBuilder contextBuilder = new StringBuilder();
            List<String> sourcesList = new ArrayList<>();
            int idx = 1;
            for (DocumentChunk chunk : topChunks) {
                contextBuilder.append("\nSource Reference #").append(idx).append(":\n")
                        .append(chunk.getContent()).append("\n-----------------\n");
                sourcesList.add(chunk.getContent());
                idx++;
            }

            String prompt = "You are a specialized Document Q&A assistant.\n" +
                    "Answer the following user question using ONLY the provided document context.\n" +
                    "If the answer cannot be found or inferred from the context, state clearly that the information is not present in the document. Do not make up answers.\n\n" +
                    "CONTEXT:\n" + contextBuilder.toString() + "\n\n" +
                    "QUESTION:\n" + question;

            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> contentMap = new HashMap<>();
            contentMap.put("role", "user");
            contentMap.put("parts", List.of(Map.of("text", prompt)));
            requestBody.put("contents", List.of(contentMap));

            String jsonPayload = objectMapper.writeValueAsString(requestBody);

            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "Gemini API returned error: " + response.statusCode()));
            }

            JsonNode rootNode = objectMapper.readTree(response.body());
            String answer = rootNode.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();

            return ResponseEntity.ok(Map.of(
                    "answer", answer,
                    "sources", sourcesList
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Document query error: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}/summary")
    public ResponseEntity<?> getDocumentSummary(
            @PathVariable String id,
            @RequestHeader(value = "X-Gemini-Key", required = false) String clientKey) {

        String apiKey = (clientKey != null && !clientKey.trim().isEmpty()) ? clientKey : systemApiKey;
        if (apiKey == null || apiKey.trim().isEmpty() || "your_gemini_api_key_here".equals(apiKey)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Gemini API Key is not configured. Please supply your key in Settings."));
        }

        Document document = documentRepository.findById(id).orElse(null);
        if (document == null || !document.getUserEmail().equals(getCurrentUserEmail())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");
        }

        if (document.getSummary() != null && !document.getSummary().trim().isEmpty()) {
            return ResponseEntity.ok(Map.of("summary", document.getSummary()));
        }

        try {
            List<DocumentChunk> chunks = documentChunkRepository.findByDocumentId(id);
            if (chunks.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "No text indexed for this document."));
            }

            chunks.sort(Comparator.comparingInt(DocumentChunk::getChunkIndex));

            StringBuilder contentBuilder = new StringBuilder();
            int maxChunksToCombine = Math.min(5, chunks.size());
            for (int i = 0; i < maxChunksToCombine; i++) {
                contentBuilder.append(chunks.get(i).getContent()).append("\n");
            }

            String prompt = "You are a specialized Document Summarization assistant.\n" +
                    "Provide a comprehensive, clear, and well-structured summary of the following document. " +
                    "Highlight the primary topics, main findings, and key takeaways using bullet points and bold text where appropriate. " +
                    "Format the output using clear markdown.\n\n" +
                    "DOCUMENT TEXT:\n" + contentBuilder.toString();

            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> contentMap = new HashMap<>();
            contentMap.put("role", "user");
            contentMap.put("parts", List.of(Map.of("text", prompt)));
            requestBody.put("contents", List.of(contentMap));

            String jsonPayload = objectMapper.writeValueAsString(requestBody);

            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "Gemini API returned error: " + response.statusCode()));
            }

            JsonNode rootNode = objectMapper.readTree(response.body());
            String summaryText = rootNode.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();

            document.setSummary(summaryText);
            documentRepository.save(document);

            return ResponseEntity.ok(Map.of("summary", summaryText));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Document summary error: " + e.getMessage()));
        }
    }

    private List<DocumentChunk> findTopChunks(List<DocumentChunk> chunks, String query, int limit) {
        if (chunks.isEmpty()) return List.of();

        String[] queryWords = query.toLowerCase().replaceAll("[^a-zA-Z0-9\\s]", "").split("\\s+");
        
        Map<String, Integer> dfMap = new HashMap<>();
        for (String word : queryWords) {
            int df = 0;
            for (DocumentChunk chunk : chunks) {
                if (chunk.getContent().toLowerCase().contains(word)) {
                    df++;
                }
            }
            dfMap.put(word, df);
        }

        List<ChunkScore> scoredChunks = new ArrayList<>();
        int totalChunks = chunks.size();

        for (DocumentChunk chunk : chunks) {
            double score = 0.0;
            String contentLower = chunk.getContent().toLowerCase();
            
            for (String word : queryWords) {
                if (word.trim().isEmpty()) continue;
                
                int tf = countOccurrences(contentLower, word);
                if (tf > 0) {
                    int df = dfMap.getOrDefault(word, 0);
                    double idf = Math.log(1.0 + (double) totalChunks / (1.0 + df));
                    score += tf * idf;
                }
            }
            scoredChunks.add(new ChunkScore(chunk, score));
        }

        scoredChunks.sort((a, b) -> Double.compare(b.score, a.score));

        List<DocumentChunk> results = new ArrayList<>();
        for (int i = 0; i < Math.min(limit, scoredChunks.size()); i++) {
            if (scoredChunks.get(i).score > 0.0 || i == 0) {
                results.add(scoredChunks.get(i).chunk);
            }
        }
        return results;
    }

    private int countOccurrences(String text, String word) {
        if (word == null || word.trim().isEmpty()) return 0;
        int count = 0;
        int idx = 0;
        while ((idx = text.indexOf(word, idx)) != -1) {
            count++;
            idx += word.length();
        }
        return count;
    }

    private static class ChunkScore {
        DocumentChunk chunk;
        double score;

        ChunkScore(DocumentChunk chunk, double score) {
            this.chunk = chunk;
            this.score = score;
        }
    }
}
