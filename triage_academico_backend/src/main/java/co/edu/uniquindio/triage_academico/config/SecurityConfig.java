package co.edu.uniquindio.triage_academico.config;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

        private final JwtFilter jwtFilter;

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                return http
                                .cors(Customizer.withDefaults())
                                .csrf(csrf -> csrf.disable())
                                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authorizeHttpRequests(auth -> auth
                                                // Endpoints públicos
                                                .requestMatchers("/api/auth/**").permitAll()
                                                .requestMatchers("/swagger-ui/**", "/api-docs/**").permitAll()

                                                // ========== Solicitudes ==========
                                                // Crear solicitud - Estudiantes, Docentes, Administrativos
                                                .requestMatchers(HttpMethod.POST, "/api/solicitudes")
                                                .hasAnyRole("ESTUDIANTE", "DOCENTE", "ADMINISTRATIVO")

                                                // Consultar solicitudes (todos los autenticados)
                                                .requestMatchers(HttpMethod.GET, "/api/solicitudes")
                                                .authenticated()
                                                .requestMatchers(HttpMethod.GET, "/api/solicitudes/**")
                                                .authenticated()

                                                // Editar solicitud - Solo si está REGISTRADA (pero cualquiera
                                                // autenticado puede intentar)
                                                .requestMatchers(HttpMethod.PUT, "/api/solicitudes/*/editar")
                                                .hasAnyRole("ESTUDIANTE", "DOCENTE", "ADMINISTRATIVO")

                                                // Clasificar - Solo administrativos
                                                .requestMatchers(HttpMethod.PATCH, "/api/solicitudes/*/clasificar")
                                                .hasRole("ADMINISTRATIVO")

                                                // Asignar responsable - Solo administrativos
                                                .requestMatchers(HttpMethod.PATCH, "/api/solicitudes/*/asignar")
                                                .hasRole("ADMINISTRATIVO")

                                                // Atender - Solo administrativos
                                                .requestMatchers(HttpMethod.PATCH, "/api/solicitudes/*/atender")
                                                .hasRole("ADMINISTRATIVO")

                                                // Cerrar - Solo administrativos
                                                .requestMatchers(HttpMethod.PATCH, "/api/solicitudes/*/cerrar")
                                                .hasRole("ADMINISTRATIVO")

                                                // Aplicar sugerencia IA - Solo administrativos
                                                .requestMatchers(HttpMethod.POST,
                                                                "/api/solicitudes/*/aplicar-sugerencia")
                                                .hasRole("ADMINISTRATIVO")

                                                // Estadísticas - Solo administrativos
                                                .requestMatchers(HttpMethod.GET, "/api/solicitudes/estadisticas")
                                                .hasRole("ADMINISTRATIVO")

                                                // ========== IA ==========
                                                // Solo administrativos
                                                .requestMatchers("/api/ia/**")
                                                .hasRole("ADMINISTRATIVO")

                                                // ========== Usuarios ==========
                                                // Gestión de usuarios - Solo administrativos
                                                .requestMatchers("/api/usuarios/**")
                                                .hasRole("ADMINISTRATIVO")

                                                // Cualquier otra cosa requiere autenticación
                                                .anyRequest().authenticated())
                                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                                .build();
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        public AuthenticationManager authManager(AuthenticationConfiguration cfg) throws Exception {
                return cfg.getAuthenticationManager();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();
                configuration.setAllowedOrigins(Arrays.asList("http://localhost:4200", "http://localhost:4201"));
                configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
                configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));
                configuration.setAllowCredentials(true);
                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }
}