package com.techsetu.backend.repository;

import com.techsetu.backend.model.Document;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends MongoRepository<Document, String> {
    List<Document> findByUserEmailOrderByCreatedAtDesc(String userEmail);
}
