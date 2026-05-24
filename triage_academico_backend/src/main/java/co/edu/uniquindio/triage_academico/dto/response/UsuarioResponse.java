package co.edu.uniquindio.triage_academico.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioResponse {

    private Long id;

    private String nombre;

    private String apellido;

    private String email;

    private String rol;

    private boolean activo;

    private LocalDateTime fechaCreacion;

    private Long version;
}