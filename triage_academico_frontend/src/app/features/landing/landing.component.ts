import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface LandingFeature {
<<<<<<< Updated upstream
  title: string;
  description: string;
}

interface LandingStep {
  number: string;
=======
  icon: string;
>>>>>>> Stashed changes
  title: string;
  description: string;
}

interface LandingRole {
<<<<<<< Updated upstream
=======
  name: string;
  description: string;
  items: string[];
}

interface HeroMetric {
  value: string;
  label: string;
}

interface ProcessStep {
  step: string;
>>>>>>> Stashed changes
  title: string;
  description: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {
  readonly logoSrc = 'assets/logo-uq.png';

  mobileMenuOpen = false;

<<<<<<< Updated upstream
  readonly features: LandingFeature[] = [
    {
      title: 'Clasificación académica',
      description: 'Organiza las solicitudes según su tipo, prioridad y responsable institucional.'
    },
    {
      title: 'Seguimiento claro',
      description: 'Permite consultar el estado del trámite desde una experiencia simple y ordenada.'
    },
    {
      title: 'Gestión por roles',
      description: 'Adapta las acciones disponibles según el perfil de cada usuario del sistema.'
    }
  ];

  readonly steps: LandingStep[] = [
    {
      number: '01',
      title: 'Registro',
      description: 'El usuario ingresa su solicitud académica desde la plataforma.'
    },
    {
      number: '02',
      title: 'Clasificación',
      description: 'El sistema organiza la información para orientar el trámite.'
    },
    {
      number: '03',
      title: 'Atención',
      description: 'El responsable institucional revisa y gestiona la solicitud.'
=======
  readonly heroMetrics: HeroMetric[] = [
    {
      value: 'IA',
      label: 'Clasificación asistida'
    },
    {
      value: 'RBAC',
      label: 'Acceso por roles'
    },
    {
      value: '24/7',
      label: 'Seguimiento disponible'
    }
  ];

  readonly features: LandingFeature[] = [
    {
      icon: 'IA',
      title: 'Triaging automático',
      description: 'Clasifica solicitudes académicas de forma inteligente para reducir tiempos de revisión y priorización.'
    },
    {
      icon: 'AS',
      title: 'Asignación inteligente',
      description: 'Distribuye trámites según rol, disponibilidad y tipo de solicitud para mejorar la gestión institucional.'
    },
    {
      icon: 'RT',
      title: 'Análisis en tiempo real',
      description: 'Permite visualizar estados, métricas y tendencias para tomar decisiones académicas con mayor claridad.'
    },
    {
      icon: 'SG',
      title: 'Seguridad por roles',
      description: 'Organiza el acceso de estudiantes, docentes, administrativos, coordinadores y directores.'
    },
    {
      icon: 'UX',
      title: 'Experiencia responsiva',
      description: 'La plataforma se adapta a computador, tableta y móvil sin perder claridad ni funcionalidad.'
    },
    {
      icon: 'NV',
      title: 'Notificaciones y trazabilidad',
      description: 'Facilita el seguimiento de cada solicitud y mantiene informado al usuario durante el proceso.'
>>>>>>> Stashed changes
    }
  ];

  readonly roles: LandingRole[] = [
    {
<<<<<<< Updated upstream
      title: 'Estudiantes',
      description: 'Radican y consultan sus solicitudes académicas.'
    },
    {
      title: 'Docentes',
      description: 'Revisan trámites asociados a su participación académica.'
    },
    {
      title: 'Administrativos',
      description: 'Apoyan la gestión, validación y seguimiento institucional.'
    }
  ];

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
=======
      name: 'Estudiante',
      description: 'Gestiona y consulta sus solicitudes académicas.',
      items: ['Crear solicitudes', 'Ver seguimiento', 'Consultar historial']
    },
    {
      name: 'Docente',
      description: 'Atiende casos asignados y revisa información relevante.',
      items: ['Atender solicitudes', 'Revisar estados', 'Generar reportes']
    },
    {
      name: 'Administrativo',
      description: 'Apoya la clasificación, validación y priorización.',
      items: ['Clasificar trámites', 'Priorizar casos', 'Actualizar estados']
    },
    {
      name: 'Coordinador',
      description: 'Supervisa procesos y realiza asignaciones.',
      items: ['Gestionar usuarios', 'Asignar responsables', 'Consultar métricas']
    },
    {
      name: 'Director',
      description: 'Accede a una vista estratégica del proceso académico.',
      items: ['Analítica general', 'Reportería', 'Control institucional']
    }
  ];

  readonly processSteps: ProcessStep[] = [
    {
      step: '01',
      title: 'Recepción',
      description: 'El usuario registra la solicitud académica desde una interfaz clara y guiada.'
    },
    {
      step: '02',
      title: 'Clasificación',
      description: 'El sistema analiza la información y propone una categoría o prioridad inicial.'
    },
    {
      step: '03',
      title: 'Asignación',
      description: 'La solicitud se dirige al rol o responsable correspondiente según las reglas del proceso.'
    },
    {
      step: '04',
      title: 'Seguimiento',
      description: 'Cada usuario puede consultar el estado y la trazabilidad de sus trámites.'
    }
  ];
>>>>>>> Stashed changes

  scrollToSection(sectionId: string): void {
    this.mobileMenuOpen = false;

<<<<<<< Updated upstream
    const section = document.getElementById(sectionId);

    if (!section) {
      return;
    }

    const navbarOffset = 88;
    const sectionPosition = section.getBoundingClientRect().top + window.scrollY;
    const finalPosition = sectionPosition - navbarOffset;
=======
    const element = document.getElementById(sectionId);

    if (!element) {
      return;
    }

    const navbarOffset = 92;
    const elementPosition = element.getBoundingClientRect().top + window.scrollY;
    const finalPosition = elementPosition - navbarOffset;
>>>>>>> Stashed changes

    window.scrollTo({
      top: finalPosition,
      behavior: 'smooth'
    });
  }
<<<<<<< Updated upstream
=======

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
>>>>>>> Stashed changes
}