// js/cards.js
let cardsCatalog = [];
let currentListIds = [];
let allCardsFull = [];
let currentPage = 1;
let totalPages = 1;

async function loadData() {
  try {
    const catalogResponse = await fetch("js/data/cards-catalog.json");
    const catalogData = await catalogResponse.json();
    cardsCatalog = catalogData.catalog || [];

    const listResponse = await fetch("js/data/cards-list.json");
    const listData = await listResponse.json();
    currentListIds = listData.list || [];

    allCardsFull = currentListIds
      .map((id) => cardsCatalog.find((card) => card.id === id))
      .filter((card) => card !== undefined);

    totalPages = Math.ceil(
      allCardsFull.length / Pagination.CONFIG.MAX_CARDS_PER_PAGE,
    );
    if (totalPages === 0) totalPages = 1;

    currentPage = 1;
    updatePage();

    return allCardsFull;
  } catch (error) {
    console.error("Ошибка загрузки данных:", error);
    return [];
  }
}

function updatePage() {
  const start = (currentPage - 1) * Pagination.CONFIG.MAX_CARDS_PER_PAGE;
  const end = start + Pagination.CONFIG.MAX_CARDS_PER_PAGE;
  const allCards = allCardsFull.slice(start, end);
  renderCards(allCards);
  if (typeof updatePaginationButton === "function") updatePaginationButton();
}

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function createCardHTML(card) {
  const template = document.getElementById("card-template");
  if (!template) return "";

  let html = template.innerHTML;

  let badgesHtml = "";
  if (card.badge && Array.isArray(card.badge)) {
    card.badge.forEach((badgeText) => {
      badgesHtml += `
        <div class="card__badge">
          <img src="images/icon-unicorn.svg" alt="" class="card__badge-icon" width="20" height="20" />
          <span class="card__badge-text">${escapeHtml(badgeText)}</span>
        </div>
      `;
    });
  }

  html = html.replace(/\{\{badges\}\}/g, badgesHtml);
  html = html.replace(/\{\{image\}\}/g, card.image);
  html = html.replace(/\{\{alt\}\}/g, card.alt);
  html = html.replace(/\{\{title\}\}/g, escapeHtml(card.title));
  html = html.replace(/\{\{author\}\}/g, escapeHtml(card.author));
  html = html.replace(/\{\{description\}\}/g, escapeHtml(card.description));
  html = html.replace(/\{\{date\}\}/g, card.date);
  html = html.replace(/\{\{link\}\}/g, card.link);

  return html;
}

function showEmptyCards() {
  const container = document.getElementById("cardsGrid");
  if (!container) return;

  container.innerHTML = `
    <div class="cards-row" style="display: grid; grid-template-columns: 1fr; gap: 24px;">
      <div class="card card--empty">
        <div class="card__content card__content--empty">
          <p class="card__empty-text">Здесь может быть ваша статья</p>
          <span class="card__empty-close" aria-label="Закрыть">✕</span>
        </div>
      </div>
    </div>
  `;
}

function renderCards(cards) {
  const container = document.getElementById("cardsGrid");
  if (!container) return;

  if (!cards || cards.length === 0) {
    showEmptyCards();
    updateGradientHeight();
    adjustFiltersGap();
    return;
  }

  const grid = Pagination.calculateGrid(cards.length);
  let cardsHtml = "";
  let cardIndex = 0;

  for (let row = 0; row < grid.length; row++) {
    const cardsInRow = grid[row];
    cardsHtml += `<div class="cards-row" style="display: grid; grid-template-columns: repeat(${cardsInRow}, 1fr); gap: 24px;">`;

    for (let col = 0; col < cardsInRow; col++) {
      cardsHtml += createCardHTML(cards[cardIndex]);
      cardIndex++;
    }

    cardsHtml += `</div>`;
  }

  container.innerHTML = cardsHtml;
  updateGradientHeight();
  adjustFiltersGap();
}

function updateGradientHeight() {
  const cardsGrid = document.getElementById("cardsGrid");
  const gradientBg = document.querySelector(".gradient-bg");
  const main = document.querySelector(".main");

  if (!cardsGrid || !gradientBg || !main) return;

  const cardsHeight = cardsGrid.offsetHeight;
  const gradientHeight = cardsHeight / 2;

  const cardsRect = cardsGrid.getBoundingClientRect();
  const mainRect = main.getBoundingClientRect();
  const topOffset = cardsRect.top - mainRect.top + 117;

  gradientBg.style.setProperty("--gradient-top", `${topOffset}px`);
  gradientBg.style.setProperty("--gradient-height", `${gradientHeight}px`);
}

function adjustFiltersGap() {
  const filtersContainer = document.querySelector(".filters");
  if (!filtersContainer) return;

  const parent = filtersContainer.parentElement;
  const parentStyle = getComputedStyle(parent);
  const parentPaddingLeft = parseFloat(parentStyle.paddingLeft);
  const parentPaddingRight = parseFloat(parentStyle.paddingRight);
  const containerWidth =
    parent.clientWidth - parentPaddingLeft - parentPaddingRight;

  const filters = Array.from(filtersContainer.children);
  if (filters.length === 0) return;

  let totalFiltersWidth = 0;
  filters.forEach((filter) => {
    totalFiltersWidth += filter.offsetWidth;
  });

  let currentGap = parseInt(getComputedStyle(filtersContainer).gap) || 8;
  let neededWidth = totalFiltersWidth + currentGap * (filters.length - 1);

  while (neededWidth > containerWidth && currentGap > 4) {
    currentGap--;
    neededWidth = totalFiltersWidth + currentGap * (filters.length - 1);
  }

  if (neededWidth < containerWidth) {
    const freeSpace = containerWidth - neededWidth;
    const gapIncrease = Math.floor(freeSpace / (filters.length - 1));
    let newGap = Math.min(20, currentGap + gapIncrease);
    if (newGap > currentGap) {
      currentGap = newGap;
    }
  }

  filtersContainer.style.gap = `${currentGap}px`;
}
