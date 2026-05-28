import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface LandingFeature {
  title: string;
  description: string;
}

interface LandingStep {
  number: string;
  title: string;
  description: string;
}

interface LandingRole {
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
    }
  ];

  readonly roles: LandingRole[] = [
    {
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

  scrollToSection(sectionId: string): void {
    this.mobileMenuOpen = false;

    const section = document.getElementById(sectionId);

    if (!section) {
      return;
    }

    const navbarOffset = 88;
    const sectionPosition = section.getBoundingClientRect().top + window.scrollY;
    const finalPosition = sectionPosition - navbarOffset;

    window.scrollTo({
      top: finalPosition,
      behavior: 'smooth'
    });
  }
}