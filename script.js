// Mobile menu toggle
const menuToggle = document.getElementById('menuToggle');
const menuClose = document.getElementById('menuClose');
const mobileMenu = document.getElementById('mobileMenu');

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener('click', () => {
    mobileMenu.classList.add('open');
  });
}
if (menuClose && mobileMenu) {
  menuClose.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
  });
}
if (mobileMenu) {
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });
}

// "Read case study" pill follows the cursor while hovering a project thumbnail
document.querySelectorAll('.thumb.case-study').forEach(thumb => {
  const cta = thumb.querySelector('.cta');
  if (!cta) return;

  thumb.addEventListener('mousemove', (e) => {
    const rect = thumb.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cta.style.left = x + 'px';
    cta.style.top = y + 'px';
  });
});
