package com.techsetu.backend.controller;

import com.techsetu.backend.model.Task;
import com.techsetu.backend.model.User;
import com.techsetu.backend.repository.TaskRepository;
import com.techsetu.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public TaskController(TaskRepository taskRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    private String getCurrentUserEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @GetMapping
    public List<Task> getTasks() {
        return taskRepository.findByUserEmail(getCurrentUserEmail());
    }

    @PostMapping
    public ResponseEntity<?> createTask(@RequestBody Task taskPayload) {
        User user = userRepository.findByEmail(getCurrentUserEmail()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized user context"));
        }

        Task task = new Task(
                taskPayload.getTitle(),
                taskPayload.getDescription(),
                taskPayload.getColumn(),
                taskPayload.getPriority(),
                taskPayload.getAssignedTo(),
                taskPayload.getDueDate(),
                user
        );

        Task savedTask = taskRepository.save(task);
        return ResponseEntity.ok(savedTask);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTask(@PathVariable Long id, @RequestBody Task taskPayload) {
        Task task = taskRepository.findById(id).orElse(null);
        if (task == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Task not found"));
        }

        if (!task.getUser().getEmail().equals(getCurrentUserEmail())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access Denied"));
        }

        task.setTitle(taskPayload.getTitle());
        task.setDescription(taskPayload.getDescription());
        task.setColumn(taskPayload.getColumn());
        task.setPriority(taskPayload.getPriority());
        task.setAssignedTo(taskPayload.getAssignedTo());
        task.setDueDate(taskPayload.getDueDate());

        Task updatedTask = taskRepository.save(task);
        return ResponseEntity.ok(updatedTask);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable Long id) {
        Task task = taskRepository.findById(id).orElse(null);
        if (task == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Task not found"));
        }

        if (!task.getUser().getEmail().equals(getCurrentUserEmail())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access Denied"));
        }

        taskRepository.delete(task);
        return ResponseEntity.ok(Map.of("message", "Task deleted successfully", "id", id));
    }
}
