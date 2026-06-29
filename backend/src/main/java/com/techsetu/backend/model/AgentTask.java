package com.techsetu.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Document(collection = "agent_tasks")
public class AgentTask {
    @Id
    private String id;
    private String userEmail;
    private String taskDescription;
    private String status = "PENDING"; // PENDING, RUNNING, COMPLETED, FAILED
    private List<SubTask> subTasks = new ArrayList<>();
    private Date createdAt = new Date();

    public AgentTask() {
    }

    public AgentTask(String userEmail, String taskDescription) {
        this.userEmail = userEmail;
        this.taskDescription = taskDescription;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getTaskDescription() {
        return taskDescription;
    }

    public void setTaskDescription(String taskDescription) {
        this.taskDescription = taskDescription;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<SubTask> getSubTasks() {
        return subTasks;
    }

    public void setSubTasks(List<SubTask> subTasks) {
        this.subTasks = subTasks;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public static class SubTask {
        private String title;
        private String status = "PENDING"; // PENDING, RUNNING, COMPLETED
        private String log = "";

        public SubTask() {
        }

        public SubTask(String title) {
            this.title = title;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public String getLog() {
            return log;
        }

        public void setLog(String log) {
            this.log = log;
        }
    }
}
