const burger = document.querySelector('.burger');
const mobileMenu = document.querySelector('[data-mobile-menu]');

if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
        const expanded = burger.getAttribute('aria-expanded') === 'true';
        burger.setAttribute('aria-expanded', !expanded);
        mobileMenu.classList.toggle('mobile-menu--open');
        document.body.classList.toggle('no-scroll');
    });

    mobileMenu.querySelectorAll('a, button').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('mobile-menu--open');
            burger.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('no-scroll');
        });
    });
}