package com.techsetu.backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class SocketHandler extends TextWebSocketHandler {

    private final List<WebSocketSession> sessions = new CopyOnWriteArrayList<>();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Random random = new Random();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.add(session);
        broadcastSystemStatus();
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        // Parse incoming message to verify and broadcast
        try {
            Map<?, ?> map = objectMapper.readValue(payload, Map.class);
            String type = (String) map.get("type");
            
            if ("CHAT".equals(type) || "JOIN".equals(type)) {
                // Broadcast directly to all open sessions
                broadcast(payload);
            }
        } catch (Exception e) {
            // Log parse failure
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        sessions.remove(session);
        broadcastSystemStatus();
    }

    private void broadcast(String message) {
        for (WebSocketSession session : sessions) {
            if (session.isOpen()) {
                try {
                    session.sendMessage(new TextMessage(message));
                } catch (IOException e) {
                    // Session failed, handle closed state
                }
            }
        }
    }

    // Broadcast system diagnostics every 3 seconds to all connected sessions
    @Scheduled(fixedRate = 3000)
    public void broadcastSystemStatus() {
        if (sessions.isEmpty()) return;

        double cpu = 20 + random.nextDouble() * 15; // 20% to 35%
        double ram = 4.0 + random.nextDouble() * 0.5; // 4.0 to 4.5 GB
        
        try {
            String statusPayload = objectMapper.writeValueAsString(Map.of(
                    "type", "STATUS",
                    "cpu", Math.round(cpu * 10.0) / 10.0,
                    "ram", Math.round(ram * 100.0) / 100.0,
                    "activeUsers", sessions.size()
            ));
            
            broadcast(statusPayload);
        } catch (Exception e) {
            // Log creation failure
        }
    }
}
