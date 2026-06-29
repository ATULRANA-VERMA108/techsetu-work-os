package com.techsetu.backend.repository;

import com.techsetu.backend.model.AgentTask;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AgentTaskRepository extends MongoRepository<AgentTask, String> {
    List<AgentTask> findByUserEmailOrderByCreatedAtDesc(String userEmail);
}
