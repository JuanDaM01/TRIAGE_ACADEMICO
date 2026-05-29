package co.edu.uniquindio.triage_academico.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import co.edu.uniquindio.triage_academico.domain.SolicitudAcademica;
import co.edu.uniquindio.triage_academico.domain.enums.EstadoSolicitud;
import co.edu.uniquindio.triage_academico.domain.enums.NivelPrioridad;
import co.edu.uniquindio.triage_academico.domain.enums.TipoSolicitud;

@Repository
public interface SolicitudRepository extends JpaRepository<SolicitudAcademica, Long> {

        List<SolicitudAcademica> findByEstado(EstadoSolicitud estado);

        List<SolicitudAcademica> findByNivelPrioridad(NivelPrioridad nivelPrioridad);

        @Query("SELECT DISTINCT s FROM SolicitudAcademica s " +
                        "LEFT JOIN FETCH s.historial h " +
                        "LEFT JOIN FETCH s.asignaciones a " +
                        "LEFT JOIN FETCH a.responsable " +
                        "WHERE s.id = :id " +
                        "ORDER BY h.fechaHoraAccion ASC")
        Optional<SolicitudAcademica> findWithHistorialById(@Param("id") Long id);

        @EntityGraph(attributePaths = { "asignaciones", "asignaciones.responsable" })
        @Query("SELECT DISTINCT s FROM SolicitudAcademica s " +
                        "LEFT JOIN s.asignaciones a " +
                        "WHERE (:estado IS NULL OR s.estado = :estado) " +
                        "AND (:tipoSolicitud IS NULL OR s.tipoSolicitud = :tipoSolicitud) " +
                        "AND (:nivelPrioridad IS NULL OR s.nivelPrioridad = :nivelPrioridad) " +
                        "AND (:responsableId IS NULL OR (a.activa = true AND a.responsable.id = :responsableId))")
        Page<SolicitudAcademica> findByFiltros(@Param("estado") EstadoSolicitud estado,
                        @Param("tipoSolicitud") TipoSolicitud tipoSolicitud,
                        @Param("nivelPrioridad") NivelPrioridad nivelPrioridad,
                        @Param("responsableId") Long responsableId,
                        Pageable pageable);
}