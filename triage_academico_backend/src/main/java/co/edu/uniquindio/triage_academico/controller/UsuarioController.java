package co.edu.uniquindio.triage_academico.controller;

import co.edu.uniquindio.triage_academico.domain.Rol;
import co.edu.uniquindio.triage_academico.domain.Usuario;
import co.edu.uniquindio.triage_academico.domain.enums.NombreRol;
import co.edu.uniquindio.triage_academico.dto.request.ActualizarUsuarioRequest;
import co.edu.uniquindio.triage_academico.dto.request.RegistroUsuarioRequest;
import co.edu.uniquindio.triage_academico.dto.response.UsuarioResponse;
import co.edu.uniquindio.triage_academico.exception.BusinessException;
import co.edu.uniquindio.triage_academico.repository.RolRepository;
import co.edu.uniquindio.triage_academico.repository.UsuarioRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRATIVO')")
    public ResponseEntity<Page<UsuarioResponse>> consultarUsuarios(
            @RequestParam(required = false) NombreRol rol,
            @RequestParam(required = false) Boolean activo,
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) String email,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {

        Specification<Usuario> specification = (root, query, cb) -> cb.conjunction();

        if (rol != null) {
            specification = specification.and((root, query, cb) -> cb.equal(root.get("rol").get("nombre"), rol));
        }

        if (activo != null) {
            specification = specification.and((root, query, cb) -> cb.equal(root.get("activo"), activo));
        }

        if (StringUtils.hasText(nombre)) {
            String filtroNombre = "%" + nombre.trim().toLowerCase() + "%";

            specification = specification.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("nombre")), filtroNombre),
                    cb.like(cb.lower(root.get("apellido")), filtroNombre)));
        }

        if (StringUtils.hasText(email)) {
            String filtroEmail = "%" + email.trim().toLowerCase() + "%";

            specification = specification.and((root, query, cb) -> cb.like(cb.lower(root.get("email")), filtroEmail));
        }

        Page<UsuarioResponse> usuarios = usuarioRepository
                .findAll(specification, pageable)
                .map(this::mapearUsuario);

        return ResponseEntity.ok(usuarios);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATIVO')")
    public ResponseEntity<UsuarioResponse> obtenerUsuario(@PathVariable Long id) {
        Usuario usuario = buscarUsuarioPorId(id);
        return ResponseEntity.ok(mapearUsuario(usuario));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRATIVO')")
    public ResponseEntity<UsuarioResponse> crearUsuario(@Valid @RequestBody RegistroUsuarioRequest request) {

        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("El email ya se encuentra registrado.");
        }

        // Roles eliminados: capacidades administrativas centralizadas en ADMINISTRATIVO.

        Rol rol = buscarRol(request.getRol());

        Usuario usuario = Usuario.builder()
                .nombre(request.getNombre())
                .apellido(request.getApellido())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .rol(rol)
                .fechaCreacion(LocalDateTime.now())
                .activo(true)
                .build();

        Usuario usuarioGuardado = usuarioRepository.save(usuario);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(mapearUsuario(usuarioGuardado));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATIVO')")
    public ResponseEntity<UsuarioResponse> actualizarUsuario(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarUsuarioRequest request) {

        Usuario usuario = buscarUsuarioPorId(id);

        usuarioRepository.findByEmail(request.getEmail()).ifPresent(usuarioExistente -> {
            if (!usuarioExistente.getId().equals(id)) {
                throw new BusinessException("El email ya se encuentra registrado por otro usuario.");
            }
        });

        Rol rol = buscarRol(request.getRol());

        usuario.setNombre(request.getNombre());
        usuario.setApellido(request.getApellido());
        usuario.setEmail(request.getEmail());
        usuario.setRol(rol);

        if (StringUtils.hasText(request.getPassword())) {
            if (request.getPassword().trim().length() < 6) {
                throw new BusinessException("La contraseña debe tener mínimo 6 caracteres.");
            }

            usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        Usuario usuarioActualizado = usuarioRepository.save(usuario);

        return ResponseEntity.ok(mapearUsuario(usuarioActualizado));
    }

    @PatchMapping("/{id}/activar")
    @PreAuthorize("hasRole('ADMINISTRATIVO')")
    public ResponseEntity<UsuarioResponse> activarUsuario(@PathVariable Long id) {
        Usuario usuario = buscarUsuarioPorId(id);
        usuario.setActivo(true);

        return ResponseEntity.ok(mapearUsuario(usuarioRepository.save(usuario)));
    }

    @PatchMapping("/{id}/desactivar")
    @PreAuthorize("hasRole('ADMINISTRATIVO')")
    public ResponseEntity<UsuarioResponse> desactivarUsuario(@PathVariable Long id) {
        Usuario usuario = buscarUsuarioPorId(id);
        usuario.setActivo(false);

        return ResponseEntity.ok(mapearUsuario(usuarioRepository.save(usuario)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATIVO')")
    public ResponseEntity<Void> eliminarUsuario(@PathVariable Long id) {
        Usuario usuario = buscarUsuarioPorId(id);

        usuario.setActivo(false);
        usuarioRepository.save(usuario);

        return ResponseEntity.noContent().build();
    }

    private Usuario buscarUsuarioPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Usuario no encontrado."));
    }

    private Rol buscarRol(NombreRol nombreRol) {
        return rolRepository.findByNombre(nombreRol)
                .orElseThrow(() -> new BusinessException("Rol no encontrado: " + nombreRol));
    }

    private UsuarioResponse mapearUsuario(Usuario usuario) {
        return UsuarioResponse.builder()
                .id(usuario.getId())
                .nombre(usuario.getNombre())
                .apellido(usuario.getApellido())
                .email(usuario.getEmail())
                .rol(usuario.getRol().getNombre().name())
                .activo(usuario.isActivo())
                .fechaCreacion(usuario.getFechaCreacion())
                .version(usuario.getVersion())
                .build();
    }
}