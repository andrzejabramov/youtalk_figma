// ========== ГЕНЕРАЦИЯ КАРТОЧЕК ИЗ JSON ==========
async function loadCards() {
  try {
    const response = await fetch("js/data/cards.json");
    const data = await response.json();
    return data.cards;
  } catch (error) {
    console.error("Ошибка загрузки данных карточек:", error);
    return [];
  }
}

function fillCard(cardData, template) {
  const clone = template.content.cloneNode(true);

  // Заполняем картинку
  const img = clone.querySelector(".card__image");
  img.src = `images/${cardData.image}`;
  img.alt = cardData.alt;

  // Заполняем плашки
  if (cardData.type === "large") {
    const badgeLarge = clone.querySelector(
      ".card__badge--large .card__badge-text",
    );
    const badgeSmall = clone.querySelector(
      ".card__badge--small .card__badge-text",
    );
    if (badgeLarge) badgeLarge.textContent = cardData.badgeLarge;
    if (badgeSmall) badgeSmall.textContent = cardData.badgeSmall;
  } else {
    const badge = clone.querySelector(".card__badge--small .card__badge-text");
    if (badge) badge.textContent = cardData.badge;
  }

  // Заполняем текст
  clone.querySelector(".card__title").textContent = cardData.title;
  clone.querySelector(".card__author").textContent = cardData.author;
  clone.querySelector(".card__description").textContent = cardData.description;
  clone.querySelector(".card__date").textContent = cardData.date;
  clone.querySelector(".card__link").href = cardData.link;

  return clone;
}

async function renderCards() {
  const container = document.getElementById("cardsGrid");
  if (!container) return;

  const cards = await loadCards();
  const smallTemplate = document.getElementById("card-template");
  const largeTemplate = document.getElementById("card-large-template");

  cards.forEach((card) => {
    const template = card.type === "large" ? largeTemplate : smallTemplate;
    const cardElement = fillCard(card, template);
    container.appendChild(cardElement);
  });
  updateGradientAndEmptyState();
}

// ========== БУРГЕР-МЕНЮ ==========
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

// ========== ЗАПУСК ==========
document.addEventListener("DOMContentLoaded", () => {
  renderCards();
  initBurger();
});
