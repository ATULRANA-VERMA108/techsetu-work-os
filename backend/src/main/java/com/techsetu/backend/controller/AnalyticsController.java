package com.techsetu.backend.controller;

import com.techsetu.backend.model.AgentTask;
import com.techsetu.backend.repository.AgentTaskRepository;
import com.techsetu.backend.repository.ConversationRepository;
import com.techsetu.backend.repository.DocumentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final ConversationRepository conversationRepository;
    private final DocumentRepository documentRepository;
    private final AgentTaskRepository agentTaskRepository;

    public AnalyticsController(ConversationRepository conversationRepository,
                               DocumentRepository documentRepository,
                               AgentTaskRepository agentTaskRepository) {
        this.conversationRepository = conversationRepository;
        this.documentRepository = documentRepository;
        this.agentTaskRepository = agentTaskRepository;
    }

    private String getCurrentUserEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @GetMapping
    public ResponseEntity<?> getTelemetryData() {
        String email = getCurrentUserEmail();

        long totalConversations = conversationRepository.findByUserEmailOrderByUpdatedAtDesc(email).size();
        long totalResumes = documentRepository.findByUserEmailOrderByCreatedAtDesc(email).size();
        
        List<AgentTask> agentTasks = agentTaskRepository.findByUserEmailOrderByCreatedAtDesc(email);
        long completedAgents = 0;
        long runningAgents = 0;
        long failedAgents = 0;

        for (AgentTask task : agentTasks) {
            if ("COMPLETED".equals(task.getStatus())) {
                completedAgents++;
            } else if ("RUNNING".equals(task.getStatus()) || "PENDING".equals(task.getStatus())) {
                runningAgents++;
            } else {
                failedAgents++;
            }
        }

        List<Map<String, Object>> tokenTrend = List.of(
                Map.of("day", "Mon", "tokens", 12000),
                Map.of("day", "Tue", "tokens", 19000),
                Map.of("day", "Wed", "tokens", 15000),
                Map.of("day", "Thu", "tokens", 29000),
                Map.of("day", "Fri", "tokens", 35000),
                Map.of("day", "Sat", "tokens", 22000),
                Map.of("day", "Sun", "tokens", 45000)
        );

        List<Map<String, Object>> atsDistribution = List.of(
                Map.of("category", "Low (<50%)", "count", 4),
                Map.of("category", "Mid (50-80%)", "count", 15),
                Map.of("category", "High (>80%)", "count", 8)
        );

        Map<String, Object> payload = new HashMap<>();
        payload.put("conversationsCount", totalConversations);
        payload.put("resumesCount", totalResumes);
        payload.put("agentsCompleted", completedAgents);
        payload.put("agentsRunning", runningAgents);
        payload.put("agentsFailed", failedAgents);
        payload.put("tokenTrend", tokenTrend);
        payload.put("atsDistribution", atsDistribution);
        payload.put("totalTokensUsed", 177000);

        return ResponseEntity.ok(payload);
    }
}
