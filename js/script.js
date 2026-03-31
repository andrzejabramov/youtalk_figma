// js/script.js
let allCards = [];

async function loadCards() {
  try {
    const response = await fetch("js/data/cards.json");
    const data = await response.json();
    allCards = data.cards || [];
    return allCards;
  } catch (error) {
    console.error("Ошибка загрузки данных карточек:", error);
    return [];
  }
}

function getCardTemplates() {
  const smallTemplate = document.getElementById("card-template");
  const largeTemplate = document.getElementById("card-large-template");

  if (!smallTemplate || !largeTemplate) {
    console.error("Шаблоны карточек не найдены");
    return null;
  }

  return {
    small: smallTemplate.innerHTML,
    large: largeTemplate.innerHTML,
  };
}

function createCardHTML(card, isWide) {
  const templateId = isWide ? "card-large-template" : "card-template";
  const template = document.getElementById(templateId);
  if (!template) return "";

  let html = template.innerHTML;

  if (isWide) {
    html = html.replace(/\{\{badgeLarge\}\}/g, card.badgeLarge || card.badge);
    html = html.replace(/\{\{badgeSmall\}\}/g, card.badgeSmall || card.badge);
  } else {
    html = html.replace(/\{\{badge\}\}/g, card.badge);
  }

  html = html.replace(/\{\{image\}\}/g, card.image);
  html = html.replace(/\{\{alt\}\}/g, card.alt);
  html = html.replace(/\{\{title\}\}/g, card.title);
  html = html.replace(/\{\{author\}\}/g, card.author);
  html = html.replace(/\{\{description\}\}/g, card.description);
  html = html.replace(/\{\{date\}\}/g, card.date);
  html = html.replace(/\{\{link\}\}/g, card.link);

  return html;
}

function showEmptyCards() {
  const container = document.getElementById("cardsGrid");
  if (!container) return;

  container.innerHTML = `
        <div class="card card--placeholder"></div>
        <div class="card card--empty">
            <div class="card__content card__content--empty">
                <p class="card__empty-text">Здесь может быть ваша статья</p>
                <span class="card__empty-close" aria-label="Закрыть">✕</span>
            </div>
        </div>
        <div class="card card--placeholder"></div>
    `;
}

async function renderCards() {
  const container = document.getElementById("cardsGrid");
  if (!container) return;

  await loadCards();
  const displayCards = allCards.slice(0, Pagination.CONFIG.MAX_CARDS_PER_PAGE);

  if (displayCards.length === 0) {
    showEmptyCards();
    updateGradientHeight();
    adjustFiltersGap();
    return;
  }

  const grid = Pagination.calculateGrid(displayCards.length);
  let cardsHtml = "";
  let cardIndex = 0;

  for (let row = 0; row < grid.length; row++) {
    const cardsInRow = grid[row];
    const isWideRow = cardsInRow === 2;
    cardsHtml += `<div class="cards-row" style="display: grid; grid-template-columns: repeat(${cardsInRow}, 1fr); gap: 24px;">`;

    for (let col = 0; col < cardsInRow; col++) {
      const isWide = isWideRow;
      cardsHtml += createCardHTML(displayCards[cardIndex], isWide);
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

  // Если не помещаются — уменьшаем gap
  while (neededWidth > containerWidth && currentGap > 4) {
    currentGap--;
    neededWidth = totalFiltersWidth + currentGap * (filters.length - 1);
  }

  // Если есть свободное место — увеличиваем gap, но не более 12px
  if (neededWidth < containerWidth) {
    const freeSpace = containerWidth - neededWidth;
    const gapIncrease = Math.floor(freeSpace / (filters.length - 1));
    let newGap = Math.min(24, currentGap + gapIncrease);
    if (newGap > currentGap) {
      currentGap = newGap;
    }
  }

  filtersContainer.style.gap = `${currentGap}px`;
}

function initBurger() {
  const burger = document.querySelector(".burger");
  const mobileMenu = document.querySelector(".mobile-menu");

  if (burger && mobileMenu) {
    burger.addEventListener("click", () => {
      const expanded = burger.getAttribute("aria-expanded") === "true";
      burger.setAttribute("aria-expanded", !expanded);
      mobileMenu.classList.toggle("mobile-menu--open");
      document.body.classList.toggle("no-scroll");
    });

    mobileMenu.querySelectorAll("a, button").forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.classList.remove("mobile-menu--open");
        burger.setAttribute("aria-expanded", "false");
        document.body.classList.remove("no-scroll");
      });
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderCards();
  initBurger();

  window.addEventListener("resize", () => {
    updateGradientHeight();
    adjustFiltersGap();
  });
});
