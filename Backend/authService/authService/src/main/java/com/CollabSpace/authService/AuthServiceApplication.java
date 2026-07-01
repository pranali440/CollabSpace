package com.CollabSpace.authService;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class AuthServiceApplication {  

	public static void main(String[] args) {
		SpringApplication.run(AuthServiceApplication.class, args);
	}

	@Value("${spring.mail.username}")
	private String sender;
 
	@Value("${spring.mail.password}")
	private String password;

	@Bean
	public ModelMapper mapper(){
		return new ModelMapper();
	}
}