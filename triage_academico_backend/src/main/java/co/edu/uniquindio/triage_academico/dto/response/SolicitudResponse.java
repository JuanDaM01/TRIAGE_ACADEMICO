package co.edu.uniquindio.triage_academico.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import co.edu.uniquindio.triage_academico.domain.enums.CanalOrigen;
import co.edu.uniquindio.triage_academico.domain.enums.EstadoSolicitud;
import co.edu.uniquindio.triage_academico.domain.enums.NivelPrioridad;
import co.edu.uniquindio.triage_academico.domain.enums.TipoSolicitud;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudResponse {
    private Long id;
    private String descripcion;
    private EstadoSolicitud estado;
    private NivelPrioridad nivelPrioridad;
    private TipoSolicitud tipoSolicitud;
    private CanalOrigen canalOrigen;  // FIX: campo faltante
    private Long solicitanteId;
    private Long responsableId;
    private String responsableNombre;
    private String responsableApellido;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
    private String justificacionPrioridad;
    private LocalDateTime fechaLimite;
    private LocalDateTime fechaCierre;
    private LocalDateTime fechaResolucion;
    private String observacionCierre;
    private List<HistorialSolicitudResponse> historial;
    private Integer version;
}