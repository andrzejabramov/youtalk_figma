// js/pagination.js
const Pagination = (function () {
  const CONFIG = {
    MAX_CARDS_PER_PAGE: 9,
    GAP: 24,
    CONTAINER_WIDTH: 1200,
  };

  /**
   * Расчет сетки по алгоритму:
   * - Количество рядов = ceil(карточки / 3)
   * - Распределение зависит от остатка от деления на 3
   */
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

  /**
   * Определяет, должна ли карточка с данным индексом быть широкой
   */
  function isCardLarge(cardIndex, grid) {
    if (!grid || grid.length === 0) return false;

    let currentIndex = 0;
    for (let row = 0; row < grid.length; row++) {
      const cardsInRow = grid[row];
      const rowStart = currentIndex;
      const rowEnd = currentIndex + cardsInRow;

      if (cardIndex >= rowStart && cardIndex < rowEnd) {
        return cardsInRow === 2;
      }
      currentIndex = rowEnd;
    }
    return false;
  }

  return {
    calculateGrid,
    isCardLarge,
    CONFIG,
  };
})();
