/**
 * WireFrame-to-Gutenberg — main.js
 * JS mínimo para funcionalidades no cubiertas por bloques nativos.
 */

(function () {
  'use strict';

  // ── Cabecera: sombra al hacer scroll ──────────────────────
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => {
      header.style.boxShadow = window.scrollY > 10
        ? '0 4px 20px rgba(0,0,0,.1)'
        : '0 1px 0 var(--wp--preset--color--border)';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ── Animación de entrada (Intersection Observer) ──────────
  if ('IntersectionObserver' in window) {
    const targets = document.querySelectorAll(
      '.feature-card, .service-card, .testimonial-card, .pricing-card, .card'
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = entry.target.classList.contains('pricing-card--featured')
              ? 'scale(1.05) translateY(0)'
              : 'translateY(0)';
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    targets.forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity .45s ease, transform .45s ease';
      observer.observe(el);
    });
  }

  // ── Ancla suave para el nav interno ──────────────────────
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const id = this.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const headerHeight = header ? header.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ── Contador animado para sección stats ───────────────────
  const animateCounters = () => {
    const counters = document.querySelectorAll('.wf2g-stats h3');
    counters.forEach((counter) => {
      const text = counter.textContent.trim();
      const num  = parseFloat(text.replace(/[^0-9.]/g, ''));
      const suffix = text.replace(/[0-9.]/g, '');
      if (isNaN(num)) return;

      let start = 0;
      const duration = 1800;
      const step = 16;
      const increment = num / (duration / step);
      const update = () => {
        start += increment;
        if (start < num) {
          counter.textContent = (Number.isInteger(num) ? Math.floor(start) : start.toFixed(1)) + suffix;
          setTimeout(update, step);
        } else {
          counter.textContent = text;
        }
      };
      update();
    });
  };

  if ('IntersectionObserver' in window) {
    const statsSection = document.querySelector('.wf2g-stats');
    if (statsSection) {
      const statsObserver = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) { animateCounters(); statsObserver.disconnect(); } },
        { threshold: 0.3 }
      );
      statsObserver.observe(statsSection);
    }
  }

})();
