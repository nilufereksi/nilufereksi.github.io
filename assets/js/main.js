// Simple project loader, renderer, modal + carousel.
// Place this file at assets/js/main.js and ensure index.html includes:
// <script src="assets/js/main.js" defer></script>

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('projects-grid');
  const modal = document.getElementById('project-modal');
  const carouselTrack = modal.querySelector('.carousel-track');
  let projects = [];

  function fetchProjects() {
    return fetch('assets/data/projects.json').then(r => r.json());
  }

  function renderTechList(tech) {
    return tech.map(t => `<span class="tag">${t}</span>`).join(' ');
  }

  function createCard(p) {
    const card = document.createElement('article');
    card.className = 'project';
    card.setAttribute('data-id', p.id);
    card.setAttribute('data-tech', p.tech.join(' '));
    card.innerHTML = `
      <button class="project-thumb" aria-label="Open ${p.title}" data-open>
        <img loading="lazy" src="${p.images[0]}" alt="${p.title} thumbnail"/>
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
    return card;
  }

  function openModal(p) {
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    modal.querySelector('#modal-title').textContent = p.title;
    modal.querySelector('#modal-tagline').textContent = p.tagline;
    modal.querySelector('#modal-desc').textContent = p.description;
    modal.querySelector('#modal-tech').innerHTML = p.tech.map(t => `<span class="tag">${t}</span>`).join(' ');
    const repoLink = modal.querySelector('#modal-repo'); repoLink.href = p.repo || '#';
    const demoLink = modal.querySelector('#modal-demo'); demoLink.href = p.demo || '#';
    carouselTrack.innerHTML = '';
    p.images.forEach(src => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = `${p.title} screenshot`;
      img.loading = 'lazy';
      carouselTrack.appendChild(img);
    });
    currentIndex = 0;
    updateCarousel();
  }

  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  let currentIndex = 0;
  function updateCarousel() {
    const children = Array.from(carouselTrack.children);
    children.forEach((el, i) => {
      el.style.display = (i === currentIndex) ? 'block' : 'none';
    });
  }

  modal.querySelectorAll('[data-close]').forEach(btn => btn.addEventListener('click', closeModal));
  modal.querySelector('.carousel-prev').addEventListener('click', () => {
    currentIndex = Math.max(0, currentIndex - 1);
    updateCarousel();
  });
  modal.querySelector('.carousel-next').addEventListener('click', () => {
    const max = carouselTrack.children.length - 1;
    currentIndex = Math.min(max, currentIndex + 1);
    updateCarousel();
  });
  document.addEventListener('keydown', (e) => {
    if (modal.getAttribute('aria-hidden') === 'false') {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') { currentIndex = Math.max(0, currentIndex - 1); updateCarousel(); }
      if (e.key === 'ArrowRight') { currentIndex = Math.min(carouselTrack.children.length - 1, currentIndex + 1); updateCarousel(); }
    }
  });

  // Filters
  document.querySelectorAll('.project-filters .filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.project-filters .filter').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.getAttribute('data-filter');
      filterProjects(f);
    });
  });

  function filterProjects(filter) {
    Array.from(grid.children).forEach(card => {
      if (filter === 'all') {
        card.style.display = '';
        return;
      }
      const techs = card.getAttribute('data-tech') || '';
      card.style.display = techs.includes(filter) ? '' : 'none';
    });
  }

  // Init
  fetchProjects().then(data => {
    projects = data;
    grid.innerHTML = '';
    projects.forEach(p => grid.appendChild(createCard(p)));
    // show featured first
    const featured = projects.findIndex(p => p.featured);
    if (featured > -1) grid.insertBefore(grid.children[featured], grid.children[0]);
  }).catch(err => {
    grid.innerHTML = '<p class=\"muted\">Could not load projects (check assets/data/projects.json)</p>';
    console.error(err);
  });
});
