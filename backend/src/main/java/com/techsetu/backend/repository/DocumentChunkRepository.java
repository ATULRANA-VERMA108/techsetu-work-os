package com.techsetu.backend.repository;

import com.techsetu.backend.model.DocumentChunk;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentChunkRepository extends MongoRepository<DocumentChunk, String> {
    List<DocumentChunk> findByDocumentId(String documentId);
    void deleteByDocumentId(String documentId);
}
