package com.techsetu.backend.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.techsetu.backend.model.Message;
import com.techsetu.backend.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

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
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class GeminiService {

    @Value("${app.gemini.api-key:your_gemini_api_key_here}")
    private String systemApiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public void streamChat(String conversationId, List<Message> history, String clientKey, SseEmitter emitter, MessageRepository messageRepository) {
        String apiKey = (clientKey != null && !clientKey.trim().isEmpty()) ? clientKey : systemApiKey;
        if (apiKey == null || apiKey.trim().isEmpty() || "your_gemini_api_key_here".equals(apiKey)) {
            try {
                emitter.send(SseEmitter.event().name("error").data("API Key not configured. Please supply a custom Gemini API Key in Settings or check system properties."));
                emitter.complete();
            } catch (Exception e) {
                emitter.completeWithError(e);
            }
            return;
        }

        try {
            Map<String, Object> requestBody = new HashMap<>();
            List<Map<String, Object>> contents = new ArrayList<>();

            for (Message msg : history) {
                Map<String, Object> contentMap = new HashMap<>();
                contentMap.put("role", "user".equals(msg.getRole()) ? "user" : "model");
                
                Map<String, String> part = new HashMap<>();
                part.put("text", msg.getContent());
                contentMap.put("parts", List.of(part));
                contents.add(contentMap);
            }
            requestBody.put("contents", contents);

            String jsonPayload = objectMapper.writeValueAsString(requestBody);

            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?key=" + apiKey))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload, StandardCharsets.UTF_8))
                    .build();

            Pattern textPattern = Pattern.compile("\"text\"\\s*:\\s*\"((?:[^\"\\\\]|\\\\.)*)\"");

            client.sendAsync(request, HttpResponse.BodyHandlers.ofInputStream())
                    .thenAccept(response -> {
                        if (response.statusCode() != 200) {
                            try {
                                emitter.send(SseEmitter.event().name("error").data("API error code: " + response.statusCode()));
                                emitter.complete();
                            } catch (Exception e) {
                                emitter.completeWithError(e);
                            }
                            return;
                        }

                        try (BufferedReader reader = new BufferedReader(new InputStreamReader(response.body(), StandardCharsets.UTF_8))) {
                            String line;
                            StringBuilder fullResponse = new StringBuilder();
                            while ((line = reader.readLine()) != null) {
                                Matcher matcher = textPattern.matcher(line);
                                while (matcher.find()) {
                                    String rawText = matcher.group(1);
                                    String cleanText = unescapeJsonString(rawText);
                                    fullResponse.append(cleanText);
                                    emitter.send(SseEmitter.event().name("chunk").data(cleanText));
                                }
                            }
                            
                            // Save assistant message to MongoDB on completion
                            String finalReply = fullResponse.toString();
                            Message assistantMessage = new Message(conversationId, "model", finalReply);
                            assistantMessage.setId(UUID.randomUUID().toString());
                            messageRepository.save(assistantMessage);
                            
                            emitter.send(SseEmitter.event().name("done").data(finalReply));
                            emitter.complete();
                        } catch (Exception e) {
                            try {
                                emitter.send(SseEmitter.event().name("error").data("Stream connection read error."));
                            } catch (Exception ignored) {}
                            emitter.completeWithError(e);
                        }
                    })
                    .exceptionally(ex -> {
                        try {
                            emitter.send(SseEmitter.event().name("error").data("Network request failed."));
                        } catch (Exception ignored) {}
                        emitter.completeWithError(ex);
                        return null;
                    });

        } catch (Exception e) {
            emitter.completeWithError(e);
        }
    }

    private String unescapeJsonString(String str) {
        StringBuilder sb = new StringBuilder();
        int i = 0;
        while (i < str.length()) {
            char ch = str.charAt(i);
            if (ch == '\\' && i + 1 < str.length()) {
                char next = str.charAt(i + 1);
                switch (next) {
                    case 'n': sb.append('\n'); break;
                    case 't': sb.append('\t'); break;
                    case 'r': sb.append('\r'); break;
                    case 'b': sb.append('\b'); break;
                    case 'f': sb.append('\f'); break;
                    case '"': sb.append('"'); break;
                    case '\\': sb.append('\\'); break;
                    default: sb.append(next);
                }
                i += 2;
            } else {
                sb.append(ch);
                i++;
            }
        }
        return sb.toString();
    }
}
