// The navbar markup is fetched and injected into #navbar asynchronously on every
// page, so this listens on document (always present) and uses delegation instead
// of querying .ham-menu/.mobile-menu directly at script-load time.
document.addEventListener('click', (e) => {
  const hamMenu = e.target.closest('.ham-menu');
  const mobileLink = e.target.closest('.mobile-menu a, .mobile-menu button');

  if (hamMenu) {
    const mobileMenu = document.querySelector('.mobile-menu');
    if (!mobileMenu) return;
    const isActive = hamMenu.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    hamMenu.setAttribute('aria-expanded', String(isActive));
    return;
  }

  if (mobileLink) {
    document.querySelector('.ham-menu')?.classList.remove('active');
    document.querySelector('.mobile-menu')?.classList.remove('active');
    document.querySelector('.ham-menu')?.setAttribute('aria-expanded', 'false');
  }
});
