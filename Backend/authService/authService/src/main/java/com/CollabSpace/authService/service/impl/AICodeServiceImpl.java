//package com.CollabSpace.authService.service.impl;
//
//import com.CollabSpace.authService.dtos.CodeRequest;
//import com.CollabSpace.authService.dtos.CodeResponseDto;
//import com.CollabSpace.authService.service.AICodeService;
//
//import com.fasterxml.jackson.databind.JsonNode;
//import com.fasterxml.jackson.databind.ObjectMapper;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.stereotype.Service;
//import org.springframework.web.reactive.function.client.WebClient;
//import org.springframework.web.reactive.function.client.WebClientResponseException;
//
//import java.util.Map;
//
//@Service
//public class AICodeServiceImpl implements AICodeService {
//
//    private final WebClient webClient;
//
//    @Value("${gemini.api.url}")
//    private String geminiApiUrl;
//    @Value("${gemini.api.key}")
//    private String geminiApiKey;
//
//    public AICodeServiceImpl(WebClient.Builder webClientBuilder) {
//        this.webClient = webClientBuilder.build();
//    }
//
//    @Override
//    public CodeResponseDto generateCode(CodeRequest codeRequest) {
//        String prompt = buildPrompt(codeRequest);
//        
//        System.out.println("=== AI Request Received ===");        // ✅ add
//        System.out.println("Mode: " + codeRequest.getMode());     // ✅ add
//        System.out.println("Code: " + codeRequest.getCode());     // ✅ add
//        System.out.println("Language: " + codeRequest.getLanguage()); // ✅ add
//        
//        System.out.println("Calling Gemini API at: " + geminiApiUrl + geminiApiKey);
//        System.out.println("Generated Prompt: " + prompt);
//
//        Map<String, Object> requestBody = Map.of(
//                "contents", new Object[] {
//                        Map.of("parts", new Object[] {
//                                Map.of("text", prompt)
//                        })
//                }
//        );
//
//        try {
//            String response = webClient.post()
//                    .uri(geminiApiUrl + geminiApiKey)
//                    .header("Content-Type", "application/json")
//                    .bodyValue(requestBody)
//                    .retrieve()
//                    .bodyToMono(String.class)
//                    .block();
//
//            String aiResponse = extractResponseContent(response);
//
//            // ✅ strip markdown for execute mode
//            if ("execute".equals(codeRequest.getMode())) {
//                aiResponse = aiResponse
//                    .replaceAll("```[a-zA-Z]*\\n?", "")
//                    .replaceAll("```", "")
//                    .trim();
//            }
//
//            return CodeResponseDto.builder()
//                    .content(aiResponse)
//                    .build();
//        } catch (WebClientResponseException e) {
//            System.err.println("API returned error: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
//            return CodeResponseDto.builder()
//                    .content("We couldn’t generate your code right now. Please try again.")
//                    .build();
//        }
//    }
//
//    private String extractResponseContent(String response) {
//        try {
//            ObjectMapper mapper = new ObjectMapper();
//            JsonNode rootNode = mapper.readTree(response);
//            return rootNode.path("candidates")
//                    .get(0)
//                    .path("content")
//                    .path("parts")
//                    .get(0)
//                    .path("text")
//                    .asText();
//        } catch (Exception e) {
//            return "Error processing request: " + e.getMessage();
//        }
//    }
//
//    private String buildPrompt(CodeRequest codeRequest) {
//        StringBuilder prompt = new StringBuilder();
//
//        if ("execute".equals(codeRequest.getMode())) {
//            prompt.append("You are a code executor. Execute this ")
//                  .append(codeRequest.getLanguage())
//                  .append(" code and show ONLY the output, nothing else. No explanation. If there are errors show only the error message.\n\n")
//                  .append("Code:\n```")
//                  .append(codeRequest.getLanguage())
//                  .append("\n")
//                  .append(codeRequest.getCode())
//                  .append("\n```");
//        } else {
//            prompt.append("Provide a detailed explanation of \"")
//                  .append(codeRequest.getPrompt())
//                  .append("\" in ")
//                  .append(codeRequest.getLanguage())
//                  .append(", including what it is and how it works, followed by a concise code example in ")
//                  .append(codeRequest.getLanguage())
//                  .append(". Format the response with a clear explanation section and a code section marked with ```")
//                  .append(codeRequest.getLanguage())
//                  .append("\n<your code here>\n```.");
//        }
//        return prompt.toString();
//    }
//}










package com.CollabSpace.authService.service.impl;

import com.CollabSpace.authService.dtos.CodeRequest;
import com.CollabSpace.authService.dtos.CodeResponseDto;
import com.CollabSpace.authService.service.AICodeService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import java.util.List;
import java.util.Map;

@Service
public class AICodeServiceImpl implements AICodeService {

    private final WebClient webClient;

    @Value("${groq.api.url}")
    private String groqApiUrl;

    @Value("${groq.api.key}")
    private String groqApiKey;

    public AICodeServiceImpl(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    @Override
    public CodeResponseDto generateCode(CodeRequest codeRequest) {
        String prompt = buildPrompt(codeRequest);

        System.out.println("=== AI Request Received ===");
        System.out.println("Mode: " + codeRequest.getMode());
        System.out.println("Language: " + codeRequest.getLanguage());
        System.out.println("Generated Prompt: " + prompt);

        // ✅ Groq uses OpenAI-compatible format
        Map<String, Object> requestBody = Map.of(
            "model", "llama-3.3-70b-versatile", // ✅ free and fast
            "messages", List.of(
                Map.of(
                    "role", "user",
                    "content", prompt
                )
            ),
            "max_tokens", 1024,
            "temperature", 0.7
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

            // ✅ strip markdown for execute mode
            if ("execute".equals(codeRequest.getMode())) {
                aiResponse = aiResponse
                    .replaceAll("```[a-zA-Z]*\\n?", "")
                    .replaceAll("```", "")
                    .trim();
            }

            return CodeResponseDto.builder()
                    .content(aiResponse)
                    .build();

        } catch (WebClientResponseException e) {
            System.err.println("Groq API error: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
            return CodeResponseDto.builder()
                    .content("We couldn't generate your code right now. Please try again.")
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

    private String buildPrompt(CodeRequest codeRequest) {
        StringBuilder prompt = new StringBuilder();

        if ("execute".equals(codeRequest.getMode())) {
            prompt.append("You are a code executor. Execute this ")
                  .append(codeRequest.getLanguage())
                  .append(" code and show ONLY the output, nothing else. No explanation. If there are errors show only the error message.\n\n")
                  .append("Code:\n```")
                  .append(codeRequest.getLanguage())
                  .append("\n")
                  .append(codeRequest.getCode())
                  .append("\n```");
        } else {
            prompt.append("Provide a detailed explanation of \"")
                  .append(codeRequest.getPrompt())
                  .append("\" in ")
                  .append(codeRequest.getLanguage())
                  .append(", including what it is and how it works, followed by a concise code example in ")
                  .append(codeRequest.getLanguage())
                  .append(". Format the response with a clear explanation section and a code section marked with ```")
                  .append(codeRequest.getLanguage())
                  .append("\n<your code here>\n```.");
        }
        return prompt.toString();
    }
}
