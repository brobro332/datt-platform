package xyz.datt.global.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import xyz.datt.global.security.JwtAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
            .cors(Customizer.withDefaults())
            .formLogin(AbstractHttpConfigurer::disable)
            .httpBasic(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth ->
                auth.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                    .requestMatchers(
                        "/api/health", "/api/admin/batch/run",
                        "/api/auth/signup", "/api/auth/login", "/api/auth/reissue", "/api/auth/logout",
                        "/api/auth/check-email", "/api/auth/check-nickname",
                        "/api/auth/email/send", "/api/auth/email/verify", "/api/auth/social/**",
                        "/api/place-masters", "/api/batch/place-sync",
                        "/api/subway-stations", "/api/admin/subway-stations/sync",
                        "/uploads/**").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/stats").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/anchors/{anchorId}").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/places/{placeId:[0-9]+}").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/places/{placeId:[0-9]+}/reviews").permitAll()
                    .anyRequest().authenticated()
            )
            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}