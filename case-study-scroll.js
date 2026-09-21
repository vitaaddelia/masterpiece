// Highlights the sidebar nav link for whichever section is currently in view
(function () {
  const navLinks = document.querySelectorAll('.cs-nav a');
  if (!navLinks.length) return;

  const sections = Array.from(navLinks)
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if (!sections.length) return;

  const setActive = (id) => {
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + id);
    });
  };

  const observer = new IntersectionObserver((entries) => {
    // Pick the entry closest to the top of the viewport that's currently visible
    const visible = entries.filter(e => e.isIntersecting);
    if (visible.length > 0) {
      visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      setActive(visible[0].target.id);
    }
  }, {
    rootMargin: '-15% 0px -70% 0px',
    threshold: 0
  });

  sections.forEach(section => observer.observe(section));
})();
