package com.example.Sneakers;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.ai.embedding.EmbeddingModel;

@SpringBootTest
class SneakersApplicationTests {

	@MockBean
	private EmbeddingModel embeddingModel;

	@Test
	void contextLoads() {
	}

}
