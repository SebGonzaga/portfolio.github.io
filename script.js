document.documentElement.classList.remove('no-js');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(reduceMotion){ document.documentElement.classList.add('reduced-motion'); }

gsap.registerPlugin(ScrollTrigger);

/* ---------- Navbar scroll state ---------- */
const navbar = document.getElementById('navbar');
ScrollTrigger.create({
  start: 'top -80',
  onUpdate: (self) => {
    if (window.scrollY > 40) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  }
});

/* ---------- Scroll progress bar ---------- */
const progressBar = document.getElementById('scroll-progress');
gsap.to(progressBar, {
  width: '100%',
  ease: 'none',
  scrollTrigger: { scrub: 0.3, start: 0, end: () => document.documentElement.scrollHeight - window.innerHeight }
});

/* ---------- Mobile menu ---------- */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('active');
  hamburger.setAttribute('aria-expanded', open);
});
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  mobileMenu.classList.remove('open');
  hamburger.classList.remove('active');
}));

/* ---------- Cursor glow ---------- */
const glow = document.getElementById('cursor-glow');
if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
  window.addEventListener('mousemove', (e) => {
    gsap.to(glow, { x: e.clientX, y: e.clientY, duration: 0.6, ease: 'power3.out' });
  });
}

/* ---------- Magnetic buttons ---------- */
if (!reduceMotion) {
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      gsap.to(el, { x: x * 0.28, y: y * 0.35, duration: 0.4, ease: 'power3.out' });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1,0.4)' });
    });
  });
}

/* ---------- Reveal animations ---------- */
if (!reduceMotion) {
  gsap.utils.toArray('.reveal').forEach((el, i) => {
    gsap.to(el, {
      opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' }
    });
  });

  /* Section titles subtle scale-in */
  gsap.utils.toArray('.section-title').forEach(el => {
    gsap.fromTo(el, { scale: 0.96 }, {
      scale: 1, duration: 1, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%' }
    });
  });

  /* Hero parallax grid */
  gsap.to('.hero-grid', {
    yPercent: 18, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });
} else {
  document.querySelectorAll('.reveal').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
}

/* ---------- Skill bar fill on view ---------- */
document.querySelectorAll('.skill-bar-fill').forEach(bar => {
  ScrollTrigger.create({
    trigger: bar,
    start: 'top 90%',
    once: true,
    onEnter: () => { bar.style.width = bar.dataset.fill + '%'; }
  });
});

/* ---------- Horizontal scroll projects ---------- */
(function () {
  const track = document.getElementById('projectsTrack');
  const section = document.querySelector('.projects-pin');
  if (!track || !section) return;

  function build() {
    ScrollTrigger.getAll().forEach(st => { if (st.vars.id === 'projScroll') st.kill(); });
    if (window.innerWidth < 760) return; // native scroll on mobile

    const scrollAmount = track.scrollWidth - window.innerWidth + 64;
    if (scrollAmount <= 0) return;

    gsap.to(track, {
      x: -scrollAmount,
      ease: 'none',
      scrollTrigger: {
        id: 'projScroll',
        trigger: section,
        start: 'top top',
        end: () => '+=' + scrollAmount,
        scrub: 0.6,
        pin: true,
        invalidateOnRefresh: true
      }
    });
  }
  build();
  window.addEventListener('resize', () => { ScrollTrigger.refresh(); });
})();

/* ---------- Hero typewriter ---------- */
(function () {
  const el = document.getElementById('typewriter');
  const lines = [
    { html: '<span class="key">"name"</span>: <span class="val">"Sebastian M. Gonzaga"</span>' },
    { html: '<span class="key">"role"</span>: <span class="val">"IT Student / AI Dev"</span>' },
    { html: '<span class="key">"location"</span>: <span class="val">"Philippines"</span>' },
    { html: '<span class="key">"school"</span>: <span class="val">"PUP"</span>' },
    { html: '<span class="key">"stack"</span>: [<span class="str">"Python"</span>, <span class="str">"Java"</span>, <span class="str">"SQL"</span>, <span class="str">"AI"</span>]' },
    { html: '<span class="key">"status"</span>: <span class="val">"building &amp; learning"</span>' },
  ];

  if (reduceMotion) {
    el.innerHTML = lines.map(l => `<div class="line">${l.html}</div>`).join('');
    return;
  }

  let i = 0;
  function typeLine() {
    if (i >= lines.length) {
      const caret = document.createElement('span');
      caret.className = 'caret';
      el.appendChild(caret);
      return;
    }
    const div = document.createElement('div');
    div.className = 'line';
    el.appendChild(div);
    const full = lines[i].html;
    // reveal via char-count on plain text length, then set final HTML for correct markup
    const plain = full.replace(/<[^>]+>/g, '');
    let charCount = 0;
    const totalChars = plain.length;
    const speed = 14;
    const interval = setInterval(() => {
      charCount++;
      const ratio = charCount / totalChars;
      div.textContent = plain.slice(0, charCount);
      if (charCount >= totalChars) {
        clearInterval(interval);
        div.innerHTML = full;
        i++;
        setTimeout(typeLine, 160);
      }
    }, speed);
  }
  typeLine();
})();