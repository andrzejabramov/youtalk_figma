// js/pagination.js
const Pagination = (function () {
  function getMaxCardsPerPage() {
    const width = window.innerWidth;
    if (width <= 767) return 4;
    return 9;
  }

  const CONFIG = {
    get MAX_CARDS_PER_PAGE() {
      return getMaxCardsPerPage();
    },
    GAP: 24,
    CONTAINER_WIDTH: 1200,
  };

  function calculateGrid(totalCards) {
    const n = Math.min(totalCards, CONFIG.MAX_CARDS_PER_PAGE);

    if (n === 0) return [];
    if (n === 1) return [1];
    if (n === 2) return [2];

    const remainder = n % 3;
    const rows = Math.ceil(n / 3);
    const grid = [];

    switch (remainder) {
      case 0:
        for (let i = 0; i < rows; i++) grid.push(3);
        break;
      case 2:
        grid.push(2);
        for (let i = 1; i < rows; i++) grid.push(3);
        break;
      case 1:
        grid.push(2);
        grid.push(2);
        for (let i = 2; i < rows; i++) grid.push(3);
        break;
    }

    return grid;
  }

  return {
    calculateGrid,
    CONFIG,
  };
})();
