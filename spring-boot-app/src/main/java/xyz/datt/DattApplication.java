package xyz.datt;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableJpaAuditing
@EnableAsync
public class DattApplication {

	public static void main(String[] args) {
		Dotenv dotenv = Dotenv.configure()
				.ignoreIfMissing()
				.load();

		// DATT/spring-boot-app 내부의 .env도 폴백으로 탐색
		if (dotenv.get("APP_KAKAO_CLIENT_ID") == null) {
			dotenv = Dotenv.configure()
					.directory("./spring-boot-app")
					.ignoreIfMissing()
					.load();
		}

		dotenv.entries().forEach(entry ->
			System.setProperty(entry.getKey(), entry.getValue())
		);

		SpringApplication.run(DattApplication.class, args);
	}

}
