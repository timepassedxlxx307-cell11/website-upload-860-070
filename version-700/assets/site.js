
const CATALOG_URL = './assets/catalog.json';

let __catalogPromise = null;
async function loadCatalog() {
  if (!__catalogPromise) {
    __catalogPromise = fetch(CATALOG_URL).then(r => r.json()).catch(() => []);
  }
  return __catalogPromise;
}

function qs(sel, root = document) {
  return root.querySelector(sel);
}

function qsa(sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
}

function setActiveNav() {
  const path = location.pathname.split('/').pop() || 'index.html';
  qsa('[data-nav] a').forEach(a => {
    const target = a.getAttribute('href');
    if (target === path) a.classList.add('active');
  });
}

function toggleMenu() {
  const btn = qs('[data-menu-toggle]');
  const nav = qs('[data-nav]');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => nav.classList.toggle('is-open'));
}

function initHeroSlider() {
  const slides = qsa('[data-hero-slide]');
  const dots = qsa('[data-hero-dot]');
  if (!slides.length) return;
  let index = 0;
  const activate = (i) => {
    index = (i + slides.length) % slides.length;
    slides.forEach((slide, s) => slide.classList.toggle('is-active', s === index));
    dots.forEach((dot, s) => dot.classList.toggle('active', s === index));
  };
  dots.forEach((dot, i) => dot.addEventListener('click', () => activate(i)));
  slides.forEach((slide, i) => slide.addEventListener('mouseenter', () => activate(i)));
  setInterval(() => activate(index + 1), 5000);
}

function normalizeText(v) {
  return String(v || '').toLowerCase();
}

function renderMovieCard(item) {
  return `
    <a class="movie-card" href="${item.page}">
      <div class="poster ratio">
        <img src="./${item.cover}" alt="${item.title}" loading="lazy">
        <span class="badge">${item.year}</span>
      </div>
      <div class="content">
        <h3 class="movie-title">${item.title}</h3>
        <div class="card-meta">${item.type} · ${item.region}</div>
        <p class="movie-desc">${item.brief}</p>
      </div>
    </a>
  `;
}

async function initSearchPage() {
  const root = qs('[data-search-root]');
  if (!root) return;
  const input = qs('[data-search-input]', root);
  const results = qs('[data-search-results]', root);
  const count = qs('[data-search-count]', root);
  const catalog = await loadCatalog();

  const params = new URLSearchParams(location.search);
  input.value = params.get('q') || '';

  function run() {
    const q = normalizeText(input.value).trim();
    const list = !q ? catalog.slice(0, 48) : catalog.filter(item => {
      const hay = [
        item.title, item.type, item.region, item.genre,
        ...(item.tags || []), item.brief
      ].map(normalizeText).join(' ');
      return hay.includes(q);
    });
    if (count) count.textContent = String(list.length);
    results.innerHTML = list.slice(0, 120).map(renderMovieCard).join('') || `
      <div class="panel" style="padding:18px;border-radius:18px;grid-column:1/-1;">
        没有找到匹配结果，试试输入影片名、类型、地区或标签。
      </div>
    `;
  }

  input.addEventListener('input', () => run());
  run();
}

async function initIndexQuickSearch() {
  const form = qs('[data-quick-search]');
  if (!form) return;
  const input = qs('input', form);
  const button = qs('button', form);
  if (button) {
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      const q = input.value.trim();
      location.href = `search.html?q=${encodeURIComponent(q)}`;
    });
  }
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const q = input.value.trim();
    location.href = `search.html?q=${encodeURIComponent(q)}`;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setActiveNav();
  toggleMenu();
  initHeroSlider();
  initSearchPage();
  initIndexQuickSearch();
});
