package co.edu.uniquindio.triage_academico.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SugerenciaClasificacionRequest {

    private Long solicitudId;

    @NotBlank(message = "La descripcion es obligatoria")
    private String descripcion;
}