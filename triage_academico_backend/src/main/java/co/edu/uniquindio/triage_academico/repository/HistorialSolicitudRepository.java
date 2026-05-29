package co.edu.uniquindio.triage_academico.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import co.edu.uniquindio.triage_academico.domain.HistorialSolicitud;

@Repository
public interface HistorialSolicitudRepository extends JpaRepository<HistorialSolicitud, Long> {

    List<HistorialSolicitud> findAllBySolicitudIdOrderByFechaHoraAccionAsc(Long solicitudId);
}