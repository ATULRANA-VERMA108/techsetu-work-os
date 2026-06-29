package com.techsetu.backend.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recruitment")
public class RecruitmentController {

    @Value("${app.gemini.api-key:your_gemini_api_key_here}")
    private String systemApiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping("/parse")
    public ResponseEntity<?> parseResume(
            @RequestParam("file") MultipartFile file,
            @RequestParam("jobDescription") String jobDescription,
            @RequestHeader(value = "X-Gemini-Key", required = false) String clientKey) {

        String apiKey = (clientKey != null && !clientKey.trim().isEmpty()) ? clientKey : systemApiKey;
        if (apiKey == null || apiKey.trim().isEmpty() || "your_gemini_api_key_here".equals(apiKey)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Gemini API Key is not configured. Please supply your key in Settings."));
        }

        try {
            String resumeText = "";
            String filename = file.getOriginalFilename();
            
            if (filename != null && filename.toLowerCase().endsWith(".pdf")) {
                try (PDDocument document = Loader.loadPDF(file.getBytes())) {
                    PDFTextStripper stripper = new PDFTextStripper();
                    resumeText = stripper.getText(document);
                }
            } else {
                resumeText = new String(file.getBytes(), StandardCharsets.UTF_8);
            }

            if (resumeText.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "The uploaded file is empty or text extraction failed."));
            }

            String prompt = "You are an advanced AI Recruitment and Applicant Tracking System (ATS) agent.\n" +
                    "Your task is to analyze the following candidate Resume against the provided Job Description.\n\n" +
                    "RESUME TEXT:\n" + resumeText + "\n\n" +
                    "JOB DESCRIPTION:\n" + jobDescription + "\n\n" +
                    "Provide a structured analysis in EXACTLY the following JSON format. Do not write any markdown decorations or preamble outside the JSON object.\n" +
                    "{\n" +
                    "  \"candidateName\": \"Full Name (fallback to Unknown if missing)\",\n" +
                    "  \"email\": \"Candidate Email (fallback to Unknown if missing)\",\n" +
                    "  \"skills\": [\"Array of extracted key skills from resume\"],\n" +
                    "  \"matchRate\": IntegerBetween0And100,\n" +
                    "  \"skillGap\": [\"Array of skills required in Job Description but missing or weak in the Resume\"],\n" +
                    "  \"interviewQuestions\": [\n" +
                    "    \"3-4 specific technical questions tailored to evaluate the candidate's missing skills or test their listed expertise\"\n" +
                    "  ]\n" +
                    "}";

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
                        .body(Map.of("error", "Gemini API returned error: " + response.statusCode() + " - " + response.body()));
            }

            JsonNode rootNode = objectMapper.readTree(response.body());
            JsonNode candidateNode = rootNode.path("candidates").get(0);
            if (candidateNode == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "Failed to extract candidate response from Gemini."));
            }
            
            String innerJsonText = candidateNode.path("content").path("parts").get(0).path("text").asText();
            innerJsonText = cleanJsonString(innerJsonText);

            Map<String, Object> result = objectMapper.readValue(innerJsonText, new TypeReference<Map<String, Object>>() {});
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Recruitment parsing error: " + e.getMessage()));
        }
    }

    private String cleanJsonString(String raw) {
        String clean = raw.trim();
        if (clean.startsWith("```")) {
            int firstBrace = clean.indexOf("{");
            int lastBrace = clean.lastIndexOf("}");
            if (firstBrace != -1 && lastBrace != -1 && lastBrace > firstBrace) {
                return clean.substring(firstBrace, lastBrace + 1);
            }
        }
        return clean;
    }
}
