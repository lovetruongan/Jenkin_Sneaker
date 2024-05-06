package com.example.Sneakers;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;

@SpringBootApplication(exclude = {SecurityAutoConfiguration.class })
public class SneakersApplication {

	public static void main(String[] args) {
		SpringApplication.run(SneakersApplication.class, args);
	}

}
