package com.techsetu.backend.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.techsetu.backend.model.AgentTask;
import com.techsetu.backend.repository.AgentTaskRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@RestController
@RequestMapping("/api/agents")
public class AgentController {

    @Value("${app.gemini.api-key:your_gemini_api_key_here}")
    private String systemApiKey;

    private final AgentTaskRepository agentTaskRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final ExecutorService executorService = Executors.newCachedThreadPool();

    public AgentController(AgentTaskRepository agentTaskRepository) {
        this.agentTaskRepository = agentTaskRepository;
    }

    private String getCurrentUserEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @GetMapping("/tasks")
    public List<AgentTask> getTasks() {
        return agentTaskRepository.findByUserEmailOrderByCreatedAtDesc(getCurrentUserEmail());
    }

    @GetMapping("/tasks/{id}")
    public ResponseEntity<?> getTask(@PathVariable String id) {
        AgentTask task = agentTaskRepository.findById(id).orElse(null);
        if (task == null || !task.getUserEmail().equals(getCurrentUserEmail())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");
        }
        return ResponseEntity.ok(task);
    }

    @PostMapping("/tasks")
    public ResponseEntity<?> createAgentTask(
            @RequestBody Map<String, String> body,
            @RequestHeader(value = "X-Gemini-Key", required = false) String clientKey) {

        String apiKey = (clientKey != null && !clientKey.trim().isEmpty()) ? clientKey : systemApiKey;
        if (apiKey == null || apiKey.trim().isEmpty() || "your_gemini_api_key_here".equals(apiKey)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Gemini API Key is not configured. Please supply your key in Settings."));
        }

        String taskDesc = body.get("taskDescription");
        if (taskDesc == null || taskDesc.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Objective description is empty"));
        }

        try {
            String planPrompt = "You are an AI Agent Planner. Given the user's objective: \"" + taskDesc + "\", " +
                    "split it into 3-4 logical, sequential sub-tasks.\n" +
                    "Return ONLY a JSON array of strings representing the sub-task titles (e.g. [\"Task 1\", \"Task 2\"]). " +
                    "Do not include markdown code fences or any other text.";

            List<String> subTaskTitles = callGeminiForList(planPrompt, apiKey);
            if (subTaskTitles.isEmpty()) {
                subTaskTitles = List.of("Initialize workflow planner", "Analyze parameters", "Execute task operations", "Finalize report");
            }

            AgentTask agentTask = new AgentTask(getCurrentUserEmail(), taskDesc);
            agentTask.setId(UUID.randomUUID().toString());
            
            List<AgentTask.SubTask> subTasksList = new ArrayList<>();
            for (String title : subTaskTitles) {
                subTasksList.add(new AgentTask.SubTask(title));
            }
            agentTask.setSubTasks(subTasksList);
            agentTaskRepository.save(agentTask);

            executorService.submit(() -> runAgentSubtasksInBackground(agentTask.getId(), apiKey));

            return ResponseEntity.ok(agentTask);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Agent task creation failed: " + e.getMessage()));
        }
    }

    private void runAgentSubtasksInBackground(String taskId, String apiKey) {
        try {
            Optional<AgentTask> taskOpt = agentTaskRepository.findById(taskId);
            if (taskOpt.isEmpty()) return;

            AgentTask task = taskOpt.get();
            task.setStatus("RUNNING");
            agentTaskRepository.save(task);

            for (int i = 0; i < task.getSubTasks().size(); i++) {
                AgentTask.SubTask subTask = task.getSubTasks().get(i);
                subTask.setStatus("RUNNING");
                agentTaskRepository.save(task);

                Thread.sleep(2000);

                String executePrompt = "You are an Autonomous Coding and DevOps Agent.\n" +
                        "You are executing the sub-task: \"" + subTask.getTitle() + "\" as part of the overall objective: \"" + task.getTaskDescription() + "\".\n" +
                        "Generate detailed, step-by-step console execution logs for this sub-task, simulating actions, commands run, validations, outputs, and completions.\n" +
                        "Keep it formatted like a real developer terminal output (timestamps, shell prompts, process outputs). Do not wrap in markdown code fences.";

                String logs = callGeminiForText(executePrompt, apiKey);
                subTask.setLog(logs);
                subTask.setStatus("COMPLETED");
                agentTaskRepository.save(task);
            }

            task.setStatus("COMPLETED");
            agentTaskRepository.save(task);

        } catch (Exception e) {
            agentTaskRepository.findById(taskId).ifPresent(task -> {
                task.setStatus("FAILED");
                agentTaskRepository.save(task);
            });
        }
    }

    private List<String> callGeminiForList(String prompt, String apiKey) throws Exception {
        String rawText = callGeminiForText(prompt, apiKey);
        String cleanJson = cleanJsonString(rawText);
        try {
            return objectMapper.readValue(cleanJson, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return List.of();
        }
    }

    private String callGeminiForText(String prompt, String apiKey) throws Exception {
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
            return "";
        }

        JsonNode rootNode = objectMapper.readTree(response.body());
        return rootNode.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
    }

    private String cleanJsonString(String raw) {
        String clean = raw.trim();
        if (clean.startsWith("```")) {
            int firstBracket = clean.indexOf("[");
            int lastBracket = clean.lastIndexOf("]");
            if (firstBracket != -1 && lastBracket != -1 && lastBracket > firstBracket) {
                return clean.substring(firstBracket, lastBracket + 1);
            }
        }
        return clean;
    }
}
