package com.techsetu.backend.controller;

import com.techsetu.backend.model.Conversation;
import com.techsetu.backend.model.Message;
import com.techsetu.backend.repository.ConversationRepository;
import com.techsetu.backend.repository.MessageRepository;
import com.techsetu.backend.security.GeminiService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final GeminiService geminiService;

    public ChatController(ConversationRepository conversationRepository,
                          MessageRepository messageRepository,
                          GeminiService geminiService) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.geminiService = geminiService;
    }

    private String getCurrentUserEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @GetMapping("/conversations")
    public List<Conversation> getConversations() {
        return conversationRepository.findByUserEmailOrderByUpdatedAtDesc(getCurrentUserEmail());
    }

    @PostMapping("/conversations")
    public Conversation createConversation(@RequestBody Map<String, String> body) {
        String title = body.getOrDefault("title", "New Chat");
        Conversation conversation = new Conversation(getCurrentUserEmail(), title);
        conversation.setId(UUID.randomUUID().toString());
        return conversationRepository.save(conversation);
    }

    @DeleteMapping("/conversations/{id}")
    public ResponseEntity<?> deleteConversation(@PathVariable String id) {
        Conversation conversation = conversationRepository.findById(id).orElse(null);
        if (conversation == null || !conversation.getUserEmail().equals(getCurrentUserEmail())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");
        }
        conversationRepository.deleteById(id);
        messageRepository.deleteByConversationId(id);
        return ResponseEntity.ok().body(Map.of("message", "Conversation deleted successfully"));
    }

    @GetMapping("/conversations/{id}/messages")
    public ResponseEntity<?> getMessages(@PathVariable String id) {
        Conversation conversation = conversationRepository.findById(id).orElse(null);
        if (conversation == null || !conversation.getUserEmail().equals(getCurrentUserEmail())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");
        }
        List<Message> messages = messageRepository.findByConversationIdOrderByTimestampAsc(id);
        return ResponseEntity.ok(messages);
    }

    @PostMapping(value = "/conversations/{id}/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamChat(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            @RequestHeader(value = "X-Gemini-Key", required = false) String clientKey) {

        SseEmitter emitter = new SseEmitter(180000L); // 3 minutes timeout

        Conversation conversation = conversationRepository.findById(id).orElse(null);
        if (conversation == null || !conversation.getUserEmail().equals(getCurrentUserEmail())) {
            try {
                emitter.send(SseEmitter.event().name("error").data("Access Denied"));
                emitter.complete();
            } catch (IOException e) {
                emitter.completeWithError(e);
            }
            return emitter;
        }

        String userPrompt = body.get("prompt");
        if (userPrompt == null || userPrompt.trim().isEmpty()) {
            try {
                emitter.send(SseEmitter.event().name("error").data("Prompt is empty"));
                emitter.complete();
            } catch (IOException e) {
                emitter.completeWithError(e);
            }
            return emitter;
        }

        // Save User Message
        Message userMessage = new Message(id, "user", userPrompt);
        userMessage.setId(UUID.randomUUID().toString());
        messageRepository.save(userMessage);

        // Update Conversation Title if it was "New Chat" and update timestamp
        if ("New Chat".equals(conversation.getTitle())) {
            String newTitle = userPrompt.length() > 30 ? userPrompt.substring(0, 27) + "..." : userPrompt;
            conversation.setTitle(newTitle);
        }
        conversation.setUpdatedAt(new Date());
        conversationRepository.save(conversation);

        // Fetch past messages to build history context
        List<Message> history = messageRepository.findByConversationIdOrderByTimestampAsc(id);

        // Stream AI response asynchronously
        geminiService.streamChat(id, history, clientKey, emitter, messageRepository);

        return emitter;
    }
}
