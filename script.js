// Web de El Concursazo: apariciones al hacer scroll, frase que se ilumina y botones de la tira de capturas.
// La clase «js» la pone <head>; sin JS todo el contenido se ve tal cual.
(() => {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveals = document.querySelectorAll('.reveal');
  const words = document.querySelectorAll('.tagline-text span');

  if (!('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('is-visible'));
    words.forEach((el) => el.classList.add('is-lit'));
  } else {
    // Apariciones: una sola vez, escalonadas 60 ms entre hermanos
    const revealObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    }, { rootMargin: '0px 0px -10% 0px' });

    reveals.forEach((el) => {
      const siblings = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
      const i = Math.min(siblings.indexOf(el), 6);
      if (i > 0) el.style.setProperty('--d', `${i * 60}ms`);
      revealObserver.observe(el);
    });

    // Frase grande: las palabras que cruzan la línea de activación se iluminan de una en una, en orden de lectura
    const queue = [];
    let draining = false;
    const drain = () => {
      const next = queue.shift();
      if (!next) { draining = false; return; }
      next.classList.add('is-lit');
      setTimeout(drain, reduceMotion ? 0 : 90);
    };
    const wordObserver = new IntersectionObserver((entries) => {
      const hits = entries.filter((e) => e.isIntersecting).map((e) => e.target);
      hits.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
      for (const word of hits) {
        wordObserver.unobserve(word);
        queue.push(word);
      }
      if (!draining && queue.length) { draining = true; drain(); }
    }, { rootMargin: '0px 0px -35% 0px' });
    words.forEach((w) => wordObserver.observe(w));
  }

  // Tira de capturas: botones anterior / siguiente
  const strip = document.querySelector('.shot-strip');
  const nav = document.querySelector('.strip-nav');
  if (strip && nav) {
    const [prev, next] = nav.querySelectorAll('button');
    const step = () => {
      const shot = strip.querySelector('.shot');
      return shot.offsetWidth + parseFloat(getComputedStyle(strip).columnGap || 16);
    };
    const update = () => {
      prev.disabled = strip.scrollLeft <= 4;
      next.disabled = strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 4;
      nav.hidden = prev.disabled && next.disabled;
    };
    let ticking = false;
    strip.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { update(); ticking = false; });
    }, { passive: true });
    window.addEventListener('resize', update);
    nav.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      strip.scrollBy({ left: Number(btn.dataset.dir) * step(), behavior: reduceMotion ? 'auto' : 'smooth' });
    });
    update();
  }
})();
