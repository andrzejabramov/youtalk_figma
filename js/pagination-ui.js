// js/pagination-ui.js
function updatePaginationButton() {
  const button = document.querySelector(".blog__button");
  if (!button) return;

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;
  const isLastPage = currentPage === totalPages;

  if (hasPrev) {
    button.classList.add("blog__button--has-prev");
  } else {
    button.classList.remove("blog__button--has-prev");
  }

  if (hasNext) {
    button.classList.add("blog__button--has-next");
  } else {
    button.classList.remove("blog__button--has-next");
  }

  if (isLastPage && totalPages > 1) {
    button.classList.add("blog__button--has-smiley");
  } else {
    button.classList.remove("blog__button--has-smiley");
  }
}

function nextPage() {
  if (currentPage < totalPages) {
    currentPage++;
    updatePage();
  }
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    updatePage();
  }
}

function initPagination() {
  const button = document.querySelector(".blog__button");
  if (!button) return;

  const leftArrow = button.querySelector(".blog__button-icon--left");
  const rightArrow = button.querySelector(".blog__button-icon--right");

  if (rightArrow) {
    rightArrow.addEventListener("click", (e) => {
      e.stopPropagation();
      if (button.classList.contains("blog__button--has-next")) {
        nextPage();
      }
    });
  }

  if (leftArrow) {
    leftArrow.addEventListener("click", (e) => {
      e.stopPropagation();
      if (button.classList.contains("blog__button--has-prev")) {
        prevPage();
      }
    });
  }

  button.addEventListener("click", (e) => {
    if (
      e.target === button ||
      e.target.classList.contains("blog__button-text")
    ) {
      if (button.classList.contains("blog__button--has-next")) {
        nextPage();
      }
    }
  });
}
