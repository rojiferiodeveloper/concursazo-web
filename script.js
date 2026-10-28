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

  // Carrusel de capturas: la que cruza el centro es la activa; avanza solo hasta que alguien lo toca
  const section = document.querySelector('.shots');
  const strip = document.querySelector('.shot-strip');
  const nav = document.querySelector('.strip-nav');
  if (section && strip && nav && 'IntersectionObserver' in window) {
    const AUTOPLAY_MS = 3500;
    const shots = [...strip.querySelectorAll('.shot')];
    const [prev, next] = nav.querySelectorAll('.round-btn');
    const dotsBox = nav.querySelector('.dots');
    const dots = shots.map((shot, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'dot';
      dot.setAttribute('aria-controls', 'capturas');
      dot.setAttribute('aria-label', `Captura ${i + 1}: ${shot.querySelector('figcaption').textContent}`);
      dot.append(document.createElement('i'));
      dotsBox.append(dot);
      return dot;
    });
    section.style.setProperty('--autoplay', `${AUTOPLAY_MS}ms`);

    let active = -1;
    let inView = false;
    let paused = false;
    let stopped = reduceMotion;
    let timer;

    const schedule = () => {
      clearTimeout(timer);
      const playing = !stopped && inView && !paused;
      section.classList.toggle('is-playing', playing);
      if (playing) timer = setTimeout(() => goTo((active + 1) % shots.length), AUTOPLAY_MS);
    };
    const setActive = (i) => {
      if (i === active) return;
      active = i;
      shots.forEach((s, k) => s.classList.toggle('is-active', k === i));
      dots.forEach((d, k) => d.setAttribute('aria-current', String(k === i)));
      section.style.setProperty('--active', getComputedStyle(shots[i]).getPropertyValue('--c'));
      prev.disabled = i === 0;
      next.disabled = i === shots.length - 1;
      schedule();
    };
    const goTo = (i) => {
      const shot = shots[i];
      strip.scrollTo({
        left: shot.offsetLeft + shot.offsetWidth / 2 - strip.clientWidth / 2,
        behavior: reduceMotion ? 'auto' : 'smooth',
      });
    };
    // Cualquier gesto de la persona detiene la reproducción automática para siempre
    const stop = () => { stopped = true; schedule(); };

    // Franja estrecha en el centro de la tira: la captura que la cruza pasa a ser la activa
    const centerObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) if (entry.isIntersecting) setActive(shots.indexOf(entry.target));
    }, { root: strip, rootMargin: '0px -49% 0px -49%' });
    shots.forEach((s) => centerObserver.observe(s));

    new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; schedule(); }, { threshold: 0.5 }).observe(strip);

    section.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { paused = true; schedule(); } });
    section.addEventListener('pointerleave', () => { paused = false; schedule(); });
    section.addEventListener('focusin', () => { paused = true; schedule(); });
    section.addEventListener('focusout', () => { paused = false; schedule(); });
    strip.addEventListener('pointerdown', stop);
    strip.addEventListener('wheel', stop, { passive: true });
    strip.addEventListener('keydown', stop);

    nav.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      stop();
      const target = btn.classList.contains('dot') ? dots.indexOf(btn) : active + Number(btn.dataset.dir);
      goTo(Math.max(0, Math.min(shots.length - 1, target)));
    });

    nav.hidden = false;
    setActive(0);
  }
})();
