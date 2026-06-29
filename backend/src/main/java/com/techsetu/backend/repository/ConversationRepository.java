package com.techsetu.backend.repository;

import com.techsetu.backend.model.Conversation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConversationRepository extends MongoRepository<Conversation, String> {
    List<Conversation> findByUserEmailOrderByUpdatedAtDesc(String userEmail);
}
