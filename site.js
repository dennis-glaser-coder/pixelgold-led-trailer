(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Header beim Hochscrollen wieder einblenden, beim Runterscrollen ausblenden
  const header = document.querySelector('header');
  if (header) {
    const overlay = getComputedStyle(header).position === 'absolute';
    let lastY = window.scrollY, ticking = false;
    const pin = () => {
      if (header.classList.contains('is-pinned')) return;
      if (overlay) header.classList.add('no-anim');
      header.classList.add('is-pinned');
      if (overlay) { header.offsetHeight; header.classList.remove('no-anim'); }
    };
    const update = () => {
      ticking = false;
      const y = window.scrollY, h = header.offsetHeight;
      const shown = header.classList.contains('is-shown');
      if (y <= 2 || (y <= h && !shown)) {
        header.classList.remove('is-pinned', 'is-shown');
      } else if (y > h) {
        pin();
        if (document.body.classList.contains('menu-open') || y < lastY - 4) header.classList.add('is-shown');
        else if (y > lastY + 4) header.classList.remove('is-shown');
      }
      if (Math.abs(y - lastY) > 4) lastY = y;
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    header.addEventListener('focusin', () => header.classList.add('is-shown'));
    update();
  }

  // Inhalte beim ersten Reinscrollen ruhig einblenden
  const REVEAL = '[data-reveal]';
  if (!reduce.matches && 'IntersectionObserver' in window) {
    const items = [...document.querySelectorAll(REVEAL)].filter(el => el.getBoundingClientRect().top > window.innerHeight * 0.92);
    const io = new IntersectionObserver(entries => {
      let n = 0;
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target, delay = n++ * 70;
        io.unobserve(el);
        el.style.transitionDelay = delay + 'ms';
        el.classList.add('is-in');
        setTimeout(() => { el.classList.remove('reveal', 'is-in'); el.style.transitionDelay = ''; }, 800 + delay);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    items.forEach(el => { el.classList.add('reveal'); io.observe(el); });
  }

  // Einsatzbereich der Unterseite für die Anfrage auf der Startseite merken
  const anlass = document.body.dataset.anlass;
  if (anlass) {
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="./#"]');
      if (!a) return;
      try { sessionStorage.setItem('ledTrailerAnlass', anlass); } catch (err) {}
    });
  }

  // Bilder in einer Lightbox statt als nackte Datei öffnen
  const links = [...document.querySelectorAll('a[data-lightbox]')];
  if (!links.length) return;
  const many = links.length > 1;
  const dlg = document.createElement('dialog');
  dlg.className = 'lb';
  dlg.setAttribute('aria-label', 'Bildansicht');
  dlg.innerHTML =
    '<figure class="lb-figure"><img class="lb-img" alt=""><figcaption class="lb-caption"></figcaption></figure>' +
    '<button type="button" class="lb-btn lb-close" aria-label="Schließen"><span aria-hidden="true">×</span></button>' +
    (many ? '<button type="button" class="lb-btn lb-prev" aria-label="Vorheriges Bild"><span aria-hidden="true">‹</span></button>' +
            '<button type="button" class="lb-btn lb-next" aria-label="Nächstes Bild"><span aria-hidden="true">›</span></button>' : '');
  document.body.appendChild(dlg);
  const img = dlg.querySelector('.lb-img'), cap = dlg.querySelector('.lb-caption');
  let idx = 0;
  const show = i => {
    idx = (i + links.length) % links.length;
    const a = links[idx], thumb = a.querySelector('img');
    img.classList.remove('is-ready');
    img.onload = () => img.classList.add('is-ready');
    img.alt = thumb ? thumb.alt : '';
    img.src = a.href;
    if (img.complete && img.naturalWidth) img.classList.add('is-ready');
    cap.textContent = a.dataset.caption || img.alt;
  };
  const finish = () => { dlg.classList.remove('is-closing'); dlg.close(); document.body.classList.remove('lb-open'); };
  const close = () => {
    if (reduce.matches) { finish(); return; }
    dlg.classList.add('is-closing');
    setTimeout(finish, 180);
  };
  links.forEach((a, i) => a.addEventListener('click', e => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || typeof dlg.showModal !== 'function') return;
    e.preventDefault();
    show(i);
    dlg.showModal();
    document.body.classList.add('lb-open');
  }));
  dlg.querySelector('.lb-close').addEventListener('click', close);
  if (many) {
    dlg.querySelector('.lb-prev').addEventListener('click', () => show(idx - 1));
    dlg.querySelector('.lb-next').addEventListener('click', () => show(idx + 1));
    dlg.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') show(idx + 1);
      else if (e.key === 'ArrowLeft') show(idx - 1);
    });
    let x0 = null;
    dlg.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    dlg.addEventListener('touchend', e => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
      x0 = null;
    });
  }
  dlg.addEventListener('click', e => { if (e.target === dlg || e.target.classList.contains('lb-figure')) close(); });
  dlg.addEventListener('close', () => document.body.classList.remove('lb-open'));
})();
