// Intersection Observer for scroll animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, {
  threshold: 0.15,
  rootMargin: '0px 0px -50px 0px'
});

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    closeMobileNav();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Mobile navigation
const hamburger = document.querySelector('.nav-hamburger');
const overlay = document.querySelector('.mobile-nav-overlay');
const drawer = document.querySelector('.mobile-nav-drawer');
const closeBtn = document.querySelector('.mobile-nav-close');

function openMobileNav() {
  document.body.classList.add('nav-open');
  overlay.classList.add('active');
  drawer.classList.add('active');
  hamburger.setAttribute('aria-expanded', 'true');
}

function closeMobileNav() {
  document.body.classList.remove('nav-open');
  overlay.classList.remove('active');
  drawer.classList.remove('active');
  hamburger.setAttribute('aria-expanded', 'false');
}

hamburger.addEventListener('click', openMobileNav);
closeBtn.addEventListener('click', closeMobileNav);
overlay.addEventListener('click', closeMobileNav);

drawer.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeMobileNav);
});

// Count-up animation for stat numbers
function animateCountUp(el, target, suffix, duration) {
  const start = 0;
  const startTime = performance.now();
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + (target - start) * eased);
    el.textContent = current + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.dataset.counted) {
      entry.target.dataset.counted = 'true';
      const num = parseInt(entry.target.dataset.target, 10);
      const suffix = entry.target.dataset.suffix || '';
      animateCountUp(entry.target, num, suffix, 1200);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number[data-target]').forEach(el => {
  statObserver.observe(el);
});
