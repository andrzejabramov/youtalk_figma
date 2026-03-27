document.addEventListener("DOMContentLoaded", () => {
  const includes = document.querySelectorAll("[data-include]");

  includes.forEach(async (el) => {
    const file = el.getAttribute("data-include");
    try {
      const response = await fetch(file);
      const html = await response.text();
      el.outerHTML = html;
    } catch (error) {
      console.error(`Ошибка загрузки ${file}:`, error);
    }
  });
});
