package co.edu.uniquindio.triage_academico.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

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
                                .csrf(csrf -> csrf.disable())
                                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authorizeHttpRequests(auth -> auth
                                                // Endpoints públicos
                                                .requestMatchers("/api/auth/**").permitAll()
                                                .requestMatchers("/swagger-ui/**", "/api-docs/**").permitAll()

                                                // ========== Solicitudes ==========
                                                // Crear solicitud - Estudiantes, Docentes, Administrativos,
                                                // Coordinadores, Directores
                                                .requestMatchers(HttpMethod.POST, "/api/solicitudes")
                                                .hasAnyRole("ESTUDIANTE", "DOCENTE", "ADMINISTRATIVO", "COORDINADOR",
                                                                "DIRECTOR")

                                                // Consultar solicitudes (todos los autenticados)
                                                .requestMatchers(HttpMethod.GET, "/api/solicitudes")
                                                .authenticated()
                                                .requestMatchers(HttpMethod.GET, "/api/solicitudes/**")
                                                .authenticated()

                                                // Editar solicitud - Solo si está REGISTRADA (pero cualquiera
                                                // autenticado puede intentar)
                                                .requestMatchers(HttpMethod.PUT, "/api/solicitudes/*/editar")
                                                .hasAnyRole("ESTUDIANTE", "DOCENTE", "ADMINISTRATIVO")

                                                // Clasificar - Solo administrativos, coordinadores, directores
                                                .requestMatchers(HttpMethod.PATCH, "/api/solicitudes/*/clasificar")
                                                .hasAnyRole("ADMINISTRATIVO", "COORDINADOR", "DIRECTOR")

                                                // Asignar responsable - Solo coordinadores y directores
                                                .requestMatchers(HttpMethod.PATCH, "/api/solicitudes/*/asignar")
                                                .hasAnyRole("COORDINADOR", "DIRECTOR")

                                                // Atender - Solo administrativos, coordinadores, directores
                                                .requestMatchers(HttpMethod.PATCH, "/api/solicitudes/*/atender")
                                                .hasAnyRole("ADMINISTRATIVO", "COORDINADOR", "DIRECTOR")

                                                // Cerrar - Solo administrativos, coordinadores, directores
                                                .requestMatchers(HttpMethod.PATCH, "/api/solicitudes/*/cerrar")
                                                .hasAnyRole("ADMINISTRATIVO", "COORDINADOR", "DIRECTOR")

                                                // Aplicar sugerencia IA - Solo administrativos, coordinadores,
                                                // directores
                                                .requestMatchers(HttpMethod.POST,
                                                                "/api/solicitudes/*/aplicar-sugerencia")
                                                .hasAnyRole("ADMINISTRATIVO", "COORDINADOR", "DIRECTOR")

                                                // Estadísticas - Solo coordinadores y directores
                                                .requestMatchers(HttpMethod.GET, "/api/solicitudes/estadisticas")
                                                .hasAnyRole("COORDINADOR", "DIRECTOR")

                                                // ========== IA ==========
                                                // Solo administrativos, coordinadores, directores
                                                .requestMatchers("/api/ia/**")
                                                .hasAnyRole("ADMINISTRATIVO", "COORDINADOR", "DIRECTOR")

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
}