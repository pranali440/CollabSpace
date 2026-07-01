package com.CollabSpace.authService.service.impl;

import com.CollabSpace.authService.dtos.DiagramRequest;
import com.CollabSpace.authService.dtos.DiagramResponseDto;
import com.CollabSpace.authService.service.DiagramService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import java.util.List;
import java.util.Map;

@Service
public class DiagramServiceImpl implements DiagramService {

    private final WebClient webClient;

    @Value("${groq.api.url}")
    private String groqApiUrl;

    @Value("${groq.api.key}")
    private String groqApiKey;

    public DiagramServiceImpl(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    @Override
    public DiagramResponseDto generateDiagram(DiagramRequest diagramRequest) {
        String rawPrompt = diagramRequest.getPrompt();
        String structuredPrompt = String.format(
                "You are a Mermaid.js diagram expert. Generate a diagram for: '%s'.\n\n" +
                "STRICT RULES:\n" +
                "1. Output EXACTLY ONE Mermaid diagram block, nothing more.\n" +
                "2. Use ONLY 'flowchart TD' or 'sequenceDiagram' — no other diagram types.\n" +
                "3. Node labels must NOT contain special characters like: > < | { } quotes or parentheses inside labels.\n" +
                "4. Every node ID must be a single word with no spaces (e.g., A, B, NodeName).\n" +
                "5. Keep labels short — maximum 4 words per label.\n" +
                "6. Do NOT generate multiple diagrams or multiple mermaid blocks.\n" +
                "7. Do NOT include any explanation — output ONLY the mermaid code block.\n\n" +
                "Output format (strictly follow this):\n" +
                "```mermaid\n" +
                "flowchart TD\n" +
                "    A[Start] --> B[Step One]\n" +
                "    B --> C[End]\n" +
                "```",
                rawPrompt
        );
        return callGroqAPI(structuredPrompt);
    }

    private DiagramResponseDto callGroqAPI(String prompt) {
        System.out.println("Calling Groq API...");
        System.out.println("Generated Prompt: " + prompt);

        Map<String, Object> requestBody = Map.of(
            "model", "llama-3.3-70b-versatile",
            "messages", List.of(
                Map.of(
                    "role", "user",
                    "content", prompt
                )
            ),
            "max_tokens", 2048,
            "temperature", 0.2
        );

        try {
            String response = webClient.post()
                    .uri(groqApiUrl)
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + groqApiKey)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            String aiResponse = extractResponseContent(response);

            return DiagramResponseDto.builder()
                    .content(aiResponse)
                    .build();

        } catch (WebClientResponseException e) {
            System.err.println("Groq API error: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
            return DiagramResponseDto.builder()
                    .content("We couldn't generate your diagram right now. Please try again.")
                    .build();
        }
    }

    private String extractResponseContent(String response) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(response);
            // ✅ Groq uses OpenAI format
            return rootNode
                    .path("choices")
                    .get(0)
                    .path("message")
                    .path("content")
                    .asText();
        } catch (Exception e) {
            return "Error processing request: " + e.getMessage();
        }
    }
}