// Project loader + UI interactions
// Place at assets/js/main.js and ensure index.html includes:
// <script src="assets/js/ux.js" defer></script>
// <script src="assets/js/main.js" defer></script>

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('projects-grid');
  const searchInput = document.getElementById('project-search');
  const filterButtons = document.querySelectorAll('.project-filters .filter');
  const modal = document.getElementById('project-modal');
  const carouselTrack = modal.querySelector('.carousel-track');
  const prevBtn = modal.querySelector('.carousel-prev');
  const nextBtn = modal.querySelector('.carousel-next');
  const modalBackdrop = modal.querySelector('.modal-backdrop');
  let projects = [];
  let currentIndex = 0;

  // Lazy load using IntersectionObserver
  const io = ('IntersectionObserver' in window) ? new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const img = e.target;
        const src = img.dataset.src || img.getAttribute('data-src');
        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
        }
        io.unobserve(img);
      }
    });
  }, { rootMargin: '200px' }) : null;

  function fetchProjects() {
    return fetch('assets/data/projects.json').then(r => r.json());
  }

  function renderTechList(tech) {
    return tech.map(t => `<span class="tag">${t}</span>`).join(' ');
  }

  function createCard(p) {
    const card = document.createElement('article');
    card.className = 'project animate-card';
    card.setAttribute('data-id', p.id);
    card.setAttribute('data-title', p.title.toLowerCase());
    card.setAttribute('data-tech', p.tech.join(' ').toLowerCase());
    card.innerHTML = `
      <button class="project-thumb" aria-label="Open ${p.title}" data-open>
        <img loading="lazy" data-src="${p.images[0]}" alt="${p.title} thumbnail" class="thumb-img" />
      </button>
      <div class="project-body">
        <h4>${p.title}</h4>
        <p class="tagline">${p.tagline}</p>
        <p class="short">${p.short}</p>
        <div class="project-footer">
          <div class="tech">${renderTechList(p.tech)}</div>
          <div class="links">
            <a href="${p.repo}" target="_blank" rel="noopener" class="small">Repo</a>
            ${p.demo ? `<a href="${p.demo}" target="_blank" rel="noopener" class="small">Demo</a>` : ''}
          </div>
        </div>
      </div>
    `;
    card.querySelector('[data-open]').addEventListener('click', () => openModal(p));
    // observe thumbnail for lazy loading
    const img = card.querySelector('.thumb-img');
    if (io && img) {
      io.observe(img);
    } else if (img.dataset && img.dataset.src) {
      img.src = img.dataset.src;
    }
    return card;
  }

  function openModal(p) {
    // fill modal content
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    modal.querySelector('#modal-title').textContent = p.title;
    modal.querySelector('#modal-tagline').textContent = p.tagline;
    modal.querySelector('#modal-desc').textContent = p.description;
    modal.querySelector('#modal-tech').innerHTML = p.tech.map(t => `<span class="tag">${t}</span>`).join(' ');
    const repoLink = modal.querySelector('#modal-repo'); repoLink.href = p.repo || '#';
    const demoLink = modal.querySelector('#modal-demo'); demoLink.href = p.demo || '#';
    carouselTrack.innerHTML = '';

    // preload a few images
    p.images.forEach((src, i) => {
      const img = document.createElement('img');
      img.alt = `${p.title} screenshot ${i+1}`;
      img.dataset.idx = i;
      // use data-src to lazy-load images into carousel but set first one immediately
      if (i === 0) img.src = src;
      else img.dataset.src = src;
      carouselTrack.appendChild(img);
    });

    currentIndex = 0;
    updateCarousel();

    // attach swipe
    if (window.ux && window.ux.attachSwipe) {
      // detach previous if any
      if (modal._detachSwipe) modal._detachSwipe();
      modal._detachSwipe = window.ux.attachSwipe(carouselTrack, {
        onLeft: () => goNext(),
        onRight: () => goPrev(),
        threshold: 30
      });
    }
  }

  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    // detach swipe
    if (modal._detachSwipe) { modal._detachSwipe(); modal._detachSwipe = null; }
  }

  function updateCarousel() {
    const imgs = Array.from(carouselTrack.children);
    if (imgs.length === 0) return;
    imgs.forEach((img, idx) => {
      if (idx === currentIndex) {
        // ensure src loaded
        if (img.dataset.src) img.src = img.dataset.src;
        img.style.display = 'block';
        img.classList.add('active-slide');
      } else {
        img.style.display = 'none';
        img.classList.remove('active-slide');
      }
    });
  }
  function goPrev() {
    currentIndex = Math.max(0, currentIndex - 1);
    updateCarousel();
  }
  function goNext() {
    const imgs = carouselTrack.children.length;
    currentIndex = Math.min(imgs - 1, currentIndex + 1);
    updateCarousel();
  }

  // close handlers
  modal.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeModal));
  modalBackdrop.addEventListener('click', closeModal);

  // prev/next click handlers
  prevBtn.addEventListener('click', goPrev);
  nextBtn.addEventListener('click', goNext);

  // keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (modal.getAttribute('aria-hidden') === 'false') {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    }
  });

  // search + filter logic
  function applyFilters() {
    const term = (searchInput && searchInput.value || '').trim().toLowerCase();
    const activeFilter = Array.from(filterButtons).find(b => b.classList.contains('active'));
    const filter = activeFilter ? activeFilter.getAttribute('data-filter').toLowerCase() : 'all';

    Array.from(grid.children).forEach(card => {
      const title = card.getAttribute('data-title') || '';
      const tech = card.getAttribute('data-tech') || '';
      const matchesSearch = !term || title.includes(term) || tech.includes(term);
      const matchesFilter = filter === 'all' || tech.includes(filter);
      card.style.display = (matchesSearch && matchesFilter) ? '' : 'none';
      // add small entrance animation when shown
      if (card.style.display === '') {
        card.classList.add('entrance');
        setTimeout(() => card.classList.remove('entrance'), 700);
      }
    });
  }

  // debounce search using ux.debounce if available
  const debounced = (window.ux && window.ux.debounce) ? window.ux.debounce(applyFilters, 180) : (function(fn){
    let t; return function(){ clearTimeout(t); t = setTimeout(fn, 180); };
  })(applyFilters);

  if (searchInput) searchInput.addEventListener('input', debounced);

  // filter buttons
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // add animated active indicator
      btn.classList.add('bump');
      setTimeout(() => btn.classList.remove('bump'), 260);
      applyFilters();
    });
  });

  // load and render
  fetchProjects().then(data => {
    projects = data;
    grid.innerHTML = '';
    projects.forEach(p => grid.appendChild(createCard(p)));
    // show featured first
    const featuredIndex = projects.findIndex(p => p.featured);
    if (featuredIndex > -1) {
      const first = grid.children[featuredIndex];
      if (first) grid.insertBefore(first, grid.firstChild);
    }
  }).catch(err => {
    grid.innerHTML = '<p class="muted">Could not load projects (check assets/data/projects.json)</p>';
    console.error(err);
  });

});
