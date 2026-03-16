/* ============================================================
   4399 MY GAMES — MAIN APPLICATION JAVASCRIPT
   Vanilla JS | Zero Dependencies | Production Ready
   ============================================================ */

'use strict';

/* -------------------- State -------------------- */
const state = {
  allGames: [],
  currentCategory: 'All',
  searchQuery: '',
  heroGames: [],
  heroIndex: 0,
  heroTimer: null,
  heroHovered: false,
  modalGame: null,
  modalCarouselIndex: 0,
};

/* -------------------- DOM Refs -------------------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/* -------------------- Number Formatter -------------------- */
function formatPlays(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

/* -------------------- Star Renderer -------------------- */
function renderStars(rating) {
  const full  = Math.floor(rating);
  const half  = rating - full >= 0.4 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

/* -------------------- Category Color Map -------------------- */
const CAT_COLORS = {
  Action:    '#7c3aed',
  Puzzle:    '#059669',
  Racing:    '#dc2626',
  Arcade:    '#d97706',
  Adventure: '#7c3aed',
  Strategy:  '#0891b2',
  Casual:    '#db2777',
  Classic:   '#4f46e5',
};

function catColor(category) {
  return CAT_COLORS[category] || '#64748b';
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

/* -------------------- API Fetch Helpers -------------------- */
async function apiFetch(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

/* -------------------- HERO CAROUSEL -------------------- */
function renderHero(featuredGames) {
  state.heroGames = featuredGames;
  const hero = $('#hero');
  hero.innerHTML = '';

  featuredGames.forEach((game, i) => {
    const slide = document.createElement('div');
    slide.className = 'hero-slide' + (i === 0 ? ' active' : '');
    slide.dataset.index = i;
    slide.innerHTML = `
      <img class="hero-bg" src="${game.screenshots[0]}" alt="${game.title}" loading="${i === 0 ? 'eager' : 'lazy'}">
      <div class="hero-gradient"></div>
      <div class="hero-gradient-bottom"></div>
      <div class="hero-content">
        <div class="hero-badge">
          <span>⭐</span>
          <span>Featured Game</span>
        </div>
        <h2 class="hero-title">${game.title}</h2>
        <p class="hero-desc">${game.description}</p>
        <div class="hero-meta">
          <div class="hero-rating">
            <span class="stars">${renderStars(game.rating)}</span>
            <span class="rating-val">${game.rating.toFixed(1)}</span>
          </div>
          <span class="hero-category">${game.category}</span>
          <span class="hero-plays">${formatPlays(game.plays)} plays</span>
        </div>
        <button class="btn-play-hero" data-id="${game.id}" aria-label="Play ${game.title}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          Play Now
        </button>
      </div>
    `;
    hero.appendChild(slide);
  });

  /* Controls */
  const controls = document.createElement('div');
  controls.className = 'hero-controls';
  const dotsHtml = featuredGames.map((_, i) =>
    `<button class="hero-dot${i === 0 ? ' active' : ''}" data-index="${i}" aria-label="Slide ${i+1}"></button>`
  ).join('');
  controls.innerHTML = `<div class="hero-dots">${dotsHtml}</div>`;
  hero.appendChild(controls);

  const arrows = document.createElement('div');
  arrows.className = 'hero-arrows';
  arrows.innerHTML = `
    <button class="hero-arrow" id="hero-prev" aria-label="Previous slide">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
    </button>
    <button class="hero-arrow" id="hero-next" aria-label="Next slide">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
    </button>
  `;
  hero.appendChild(arrows);

  /* Event Listeners */
  hero.querySelectorAll('.btn-play-hero').forEach(btn => {
    btn.addEventListener('click', () => openModal(parseInt(btn.dataset.id)));
  });

  hero.querySelectorAll('.hero-dot').forEach(dot => {
    dot.addEventListener('click', () => goToHeroSlide(parseInt(dot.dataset.index)));
  });

  $('#hero-prev').addEventListener('click', () => {
    const prev = (state.heroIndex - 1 + state.heroGames.length) % state.heroGames.length;
    goToHeroSlide(prev);
  });

  $('#hero-next').addEventListener('click', () => {
    const next = (state.heroIndex + 1) % state.heroGames.length;
    goToHeroSlide(next);
  });

  hero.addEventListener('mouseenter', () => {
    state.heroHovered = true;
    stopHeroTimer();
  });
  hero.addEventListener('mouseleave', () => {
    state.heroHovered = false;
    startHeroTimer();
  });

  startHeroTimer();
}

function goToHeroSlide(index) {
  const slides = $$('.hero-slide', document.getElementById('hero'));
  const dots   = $$('.hero-dot',  document.getElementById('hero'));

  slides[state.heroIndex]?.classList.remove('active');
  dots[state.heroIndex]?.classList.remove('active');

  state.heroIndex = index;

  slides[state.heroIndex]?.classList.add('active');
  dots[state.heroIndex]?.classList.add('active');
}

function startHeroTimer() {
  stopHeroTimer();
  state.heroTimer = setInterval(() => {
    if (!state.heroHovered) {
      const next = (state.heroIndex + 1) % state.heroGames.length;
      goToHeroSlide(next);
    }
  }, 5000);
}

function stopHeroTimer() {
  if (state.heroTimer) {
    clearInterval(state.heroTimer);
    state.heroTimer = null;
  }
}

/* -------------------- CATEGORY TABS -------------------- */
function renderCategoryTabs(games) {
  const categories = ['All', ...new Set(games.map(g => g.category))].sort((a, b) =>
    a === 'All' ? -1 : b === 'All' ? 1 : a.localeCompare(b)
  );

  const counts = {};
  games.forEach(g => {
    counts[g.category] = (counts[g.category] || 0) + 1;
  });

  const container = $('#category-tabs');
  container.innerHTML = categories.map(cat => {
    const count = cat === 'All' ? games.length : (counts[cat] || 0);
    const active = cat === state.currentCategory ? ' active' : '';
    return `
      <button class="cat-tab${active}" data-cat="${cat}">
        ${cat}
        <span class="cat-count">${count}</span>
      </button>
    `;
  }).join('');

  container.querySelectorAll('.cat-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      if (tab.dataset.cat === state.currentCategory) return;
      state.currentCategory = tab.dataset.cat;
      state.searchQuery = '';
      const searchInput = $('#search-input');
      if (searchInput) searchInput.value = '';
      container.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      fetchAndRender();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

/* -------------------- GAME CARDS -------------------- */
function renderCards(games) {
  const grid = $('#games-grid');
  const countEl = $('#game-count');

  if (countEl) countEl.textContent = `${games.length} game${games.length !== 1 ? 's' : ''}`;

  if (games.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🎮</div>
        <h3>No games found</h3>
        <p>Try a different search term or category.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = games.map((game, i) => {
    const color      = game.accent_color || catColor(game.category);
    const rgb        = hexToRgb(color);
    const diffClass  = `diff-${game.difficulty.toLowerCase()}`;
    const featBadge  = game.featured ? `<span class="badge-featured">Featured</span>` : '';

    return `
      <article class="game-card" data-id="${game.id}" data-index="${i}"
               style="--card-accent: ${color}; --card-accent-rgb: ${rgb};"
               tabindex="0" role="button" aria-label="Open ${game.title}">
        <div class="card-thumb-wrap">
          <img class="card-thumb" src="${game.thumbnail}" alt="${game.title}" loading="lazy">
          <div class="card-overlay">
            <p class="overlay-desc">${game.description}</p>
            <button class="btn-play-overlay">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              Play Now
            </button>
          </div>
          ${featBadge}
          <span class="badge-category" style="background: ${color}cc;">${game.category}</span>
        </div>
        <div class="card-body">
          <h3 class="card-title">${game.title}</h3>
          <div class="card-footer">
            <div class="card-rating">
              <span class="stars">${renderStars(game.rating)}</span>
              <span class="rating-num">${game.rating.toFixed(1)}</span>
            </div>
            <span class="card-plays">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style="opacity:.6"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
              ${formatPlays(game.plays)}
            </span>
            <span class="badge-difficulty ${diffClass}">${game.difficulty}</span>
          </div>
        </div>
      </article>
    `;
  }).join('');

  /* Staggered entrance animation */
  const cards = $$('.game-card', grid);
  cards.forEach((card, i) => {
    setTimeout(() => card.classList.add('visible'), i * 50);
  });

  /* Click handlers */
  cards.forEach(card => {
    card.addEventListener('click', () => openModal(parseInt(card.dataset.id)));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(parseInt(card.dataset.id));
      }
    });
  });
}

/* -------------------- FETCH & RENDER -------------------- */
async function fetchAndRender() {
  const grid = $('#games-grid');
  grid.innerHTML = `<div class="spinner-wrap"><div class="spinner"></div></div>`;

  try {
    const category = state.currentCategory === 'All' ? '' : state.currentCategory;
    const url = `/api/games${category ? `?category=${encodeURIComponent(category)}` : ''}`;
    let games = await apiFetch(url);

    state.allGames = games;

    /* Client-side search filter */
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      games = games.filter(g =>
        g.title.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    renderCards(games);
  } catch (err) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <h3>Failed to load games</h3>
        <p>${err.message}</p>
      </div>
    `;
  }
}

/* -------------------- SEARCH -------------------- */
let searchDebounce = null;

function initSearch() {
  const input = $('#search-input');
  if (!input) return;

  input.addEventListener('input', () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      state.searchQuery = input.value.trim();

      /* Filter from cached allGames without re-fetching */
      let filtered = state.allGames;
      if (state.searchQuery) {
        const q = state.searchQuery.toLowerCase();
        filtered = filtered.filter(g =>
          g.title.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q) ||
          g.tags.some(t => t.toLowerCase().includes(q))
        );
      }
      renderCards(filtered);
    }, 300);
  });
}

/* -------------------- MODAL -------------------- */
function openModal(gameId) {
  const game = state.allGames.find(g => g.id === gameId);
  if (!game) return;

  state.modalGame = game;
  state.modalCarouselIndex = 0;

  const overlay = $('#modal-overlay');
  const panel   = $('#modal-panel');

  /* Build modal content */
  panel.innerHTML = buildModalHTML(game);

  /* Init carousel */
  initModalCarousel(game);

  /* Trap focus & open */
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  /* Close handlers */
  overlay.addEventListener('click', onOverlayClick);
  document.addEventListener('keydown', onModalKeydown);

  /* Scroll panel to top */
  panel.scrollTop = 0;

  /* Play Now button */
  $('#modal-play-btn')?.addEventListener('click', () => {
    alert(`🎮 Launching "${game.title}"...\n\n(This would open the game in a real deployment!)`);
  });
}

function buildModalHTML(game) {
  const color     = game.accent_color || catColor(game.category);
  const diffClass = `diff-${game.difficulty.toLowerCase()}`;
  const tagsHtml  = game.tags.map(t => `<span class="tag-pill">${t}</span>`).join('');
  const videoHtml = game.video_embed_url ? `
    <div class="video-wrap">
      <iframe src="${game.video_embed_url}?autoplay=0&rel=0"
              title="${game.title} Trailer"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen loading="lazy"></iframe>
    </div>
  ` : '';

  const screenshotsHtml = game.screenshots.map((src, i) =>
    `<img class="carousel-img${i === 0 ? ' active' : ''}" src="${src}" alt="${game.title} screenshot ${i+1}" loading="${i === 0 ? 'eager' : 'lazy'}" data-index="${i}">`
  ).join('');

  const dotsHtml = game.screenshots.map((_, i) =>
    `<button class="carousel-dot${i === 0 ? ' active' : ''}" data-index="${i}" aria-label="Screenshot ${i+1}"></button>`
  ).join('');

  return `
    <div class="modal-carousel">
      ${screenshotsHtml}
      <button class="carousel-arrow prev" id="carousel-prev" aria-label="Previous screenshot">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <button class="carousel-arrow next" id="carousel-next" aria-label="Next screenshot">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
      <div class="carousel-dots">${dotsHtml}</div>
      <button class="modal-close" id="modal-close" aria-label="Close modal">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="modal-body">
      <div class="modal-header">
        <div class="modal-title-block">
          <h2 class="modal-title">${game.title}</h2>
          <div class="modal-badges">
            <span class="badge-category" style="position:static; background: ${color}cc;">${game.category}</span>
            <span class="badge-difficulty ${diffClass}" style="position:static;">${game.difficulty}</span>
            ${game.featured ? '<span class="badge-featured" style="position:static;">Featured</span>' : ''}
          </div>
        </div>
      </div>

      <div class="modal-meta">
        <div class="modal-rating-wrap">
          <span class="stars" style="font-size:1rem;">${renderStars(game.rating)}</span>
          <span class="modal-rating-num">${game.rating.toFixed(1)}</span>
        </div>
        <span class="modal-plays">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
          ${formatPlays(game.plays)} plays
        </span>
      </div>

      <p class="modal-desc">${game.description}</p>

      <div class="tags-wrap">${tagsHtml}</div>

      ${videoHtml}

      <button class="btn-play-modal" id="modal-play-btn">
        <span class="play-icon-large">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        </span>
        ▶ Play Now
      </button>
    </div>
  `;
}

function initModalCarousel(game) {
  const panel = $('#modal-panel');

  const updateCarousel = (index) => {
    state.modalCarouselIndex = index;
    $$('.carousel-img', panel).forEach((img, i) => img.classList.toggle('active', i === index));
    $$('.carousel-dot', panel).forEach((dot, i) => dot.classList.toggle('active', i === index));
  };

  $('#carousel-prev', panel)?.addEventListener('click', (e) => {
    e.stopPropagation();
    const prev = (state.modalCarouselIndex - 1 + game.screenshots.length) % game.screenshots.length;
    updateCarousel(prev);
  });

  $('#carousel-next', panel)?.addEventListener('click', (e) => {
    e.stopPropagation();
    const next = (state.modalCarouselIndex + 1) % game.screenshots.length;
    updateCarousel(next);
  });

  $$('.carousel-dot', panel).forEach(dot => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      updateCarousel(parseInt(dot.dataset.index));
    });
  });

  $('#modal-close', panel)?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeModal();
  });
}

function onOverlayClick(e) {
  if (e.target === $('#modal-overlay')) closeModal();
}

function onModalKeydown(e) {
  if (e.key === 'Escape') closeModal();
  if (e.key === 'ArrowLeft'  && state.modalGame) {
    const prev = (state.modalCarouselIndex - 1 + state.modalGame.screenshots.length) % state.modalGame.screenshots.length;
    const panel = $('#modal-panel');
    $$('.carousel-img', panel).forEach((img, i) => img.classList.toggle('active', i === prev));
    $$('.carousel-dot', panel).forEach((dot, i) => dot.classList.toggle('active', i === prev));
    state.modalCarouselIndex = prev;
  }
  if (e.key === 'ArrowRight' && state.modalGame) {
    const next = (state.modalCarouselIndex + 1) % state.modalGame.screenshots.length;
    const panel = $('#modal-panel');
    $$('.carousel-img', panel).forEach((img, i) => img.classList.toggle('active', i === next));
    $$('.carousel-dot', panel).forEach((dot, i) => dot.classList.toggle('active', i === next));
    state.modalCarouselIndex = next;
  }
}

function closeModal() {
  const overlay = $('#modal-overlay');
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  overlay.removeEventListener('click', onOverlayClick);
  document.removeEventListener('keydown', onModalKeydown);
  state.modalGame = null;
}

/* -------------------- NAV LINKS -------------------- */
function initNavLinks() {
  $$('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.dataset.target;

      $$('.nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      if (target === 'home') {
        state.currentCategory = 'All';
        state.searchQuery = '';
        const searchInput = $('#search-input');
        if (searchInput) searchInput.value = '';
        $$('.cat-tab').forEach(t => t.classList.toggle('active', t.dataset.cat === 'All'));
        fetchAndRender();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (target === 'top-rated') {
        state.currentCategory = 'All';
        state.searchQuery = '';
        const searchInput = $('#search-input');
        if (searchInput) searchInput.value = '';
        $$('.cat-tab').forEach(t => t.classList.toggle('active', t.dataset.cat === 'All'));
        fetchAndRender().then(() => {
          /* Sort by rating */
          const sorted = [...state.allGames].sort((a, b) => b.rating - a.rating);
          renderCards(sorted);
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (target === 'categories') {
        const catSection = $('#category-section');
        if (catSection) catSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/* -------------------- INIT -------------------- */
async function init() {
  try {
    /* Load all games and featured in parallel */
    const [allGames, featuredGames] = await Promise.all([
      apiFetch('/api/games'),
      apiFetch('/api/featured'),
    ]);

    state.allGames = allGames;

    /* Render hero */
    renderHero(featuredGames);

    /* Render category tabs */
    renderCategoryTabs(allGames);

    /* Render cards */
    renderCards(allGames);

    /* Init search */
    initSearch();

    /* Init nav */
    initNavLinks();

  } catch (err) {
    console.error('Init failed:', err);
    const grid = $('#games-grid');
    if (grid) {
      grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⚠️</div>
          <h3>Could not connect to server</h3>
          <p>Please make sure the Flask server is running on port 5000.</p>
        </div>
      `;
    }
  }
}

/* Run when DOM is ready */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
