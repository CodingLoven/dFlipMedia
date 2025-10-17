  // Testimonials carousel js 

(function () {
  const root = document.querySelector('.sec8');
  if (!root) return;

  const mediaTrack  = root.querySelector('.sec8-media-track');
  const reviewTrack = root.querySelector('.sec8-review-track');
  const count       = root.querySelectorAll('.sec8-review-slide').length;

  const prevBtn = root.querySelector('.sec8-prev');
  const nextBtn = root.querySelector('.sec8-next');
  const dots    = Array.from(root.querySelectorAll('.sec8-dot'));

  const videos  = () => Array.from(root.querySelectorAll('.sec8-video'));
  const plays   = () => Array.from(root.querySelectorAll('.sec8-play'));

  // ===== Autoplay config =====
  const AUTOPLAY_INTERVAL = 2000; // ms between slides
  const INVIEW_THRESHOLD  = 1;  // autoplay when 50% of section is visible
  const HOVER_PAUSE       = true; // pause when mouse over the section
  const FOCUS_PAUSE       = true; // pause when section or its children focused

  let index = 0;
  let autoplayTimer = null;
  let inView = false;
  let videoPlaying = false; // true if any slide's video is currently playing

  function apply() {
    const t = `translateX(-${index * 100}%)`;
    mediaTrack.style.transform  = t;
    reviewTrack.style.transform = t;

    dots.forEach((d, i) => d.classList.toggle('is-active', i === index));

    // Pause non-active videos & manage overlays
    const vs = videos();
    const ps = plays();
    vs.forEach((v, i) => {
      if (i !== index && !v.paused) v.pause();
      if (i !== index) v.removeAttribute('controls');
    });
    ps.forEach((btn, i) => {
      const v = vs[i];
      btn.style.display = (i === index && v.paused) ? 'grid' : (i === index ? 'none' : 'grid');
    });
  }

  function go(step) {
    index = (index + step + count) % count;
    apply();
  }

  // ===== Autoplay =====
  function startAutoplay() {
    if (autoplayTimer || !inView || videoPlaying || count <= 1) return;
    autoplayTimer = setInterval(() => go(1), AUTOPLAY_INTERVAL);
  }
  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }
  function resetAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  // ===== Controls =====
  prevBtn?.addEventListener('click', () => { go(-1); resetAutoplay(); });
  nextBtn?.addEventListener('click', () => { go(1);  resetAutoplay(); });
  dots.forEach((d, i) => d.addEventListener('click', () => { index = i; apply(); resetAutoplay(); }));

  // Smart play overlay
  root.addEventListener('click', e => {
    const btn = e.target.closest('.sec8-play');
    if (!btn) return;
    const v = btn.parentElement.querySelector('.sec8-video');
    btn.style.display = 'none';
    v.setAttribute('controls', '');
    v.play();
  });

  // Pause autoplay while a video is playing; restore overlay on pause/end
  videos().forEach((v, i) => {
    v.addEventListener('play', () => {
      videoPlaying = true;
      stopAutoplay();
      const btn = v.parentElement.querySelector('.sec8-play');
      btn.style.display = 'none';
      v.setAttribute('controls', '');
    });

    const showBtn = () => {
      videoPlaying = false;
      const btn = v.parentElement.querySelector('.sec8-play');
      if (i === index) btn.style.display = 'grid';
      v.removeAttribute('controls');
      startAutoplay(); // resume if section is in view
    };

    v.addEventListener('pause', showBtn);
    v.addEventListener('ended', showBtn);
  });

  // Pause/resume on hover/focus
  if (HOVER_PAUSE) {
    root.addEventListener('mouseenter', stopAutoplay);
    root.addEventListener('mouseleave', startAutoplay);
  }
  if (FOCUS_PAUSE) {
    root.addEventListener('focusin',  stopAutoplay);
    root.addEventListener('focusout', startAutoplay);
  }

  // Visibility: pause when tab hidden, resume when visible & in view
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAutoplay();
    else startAutoplay();
  });

  // Keep transform correct on resize
  window.addEventListener('resize', () => apply());

  // In-view observer: autoplay only when the section is onscreen
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        inView = entry.isIntersecting && entry.intersectionRatio >= INVIEW_THRESHOLD;
        if (inView) startAutoplay();
        else stopAutoplay();
      });
    },
    { threshold: INVIEW_THRESHOLD }
  );
  observer.observe(root);

  // Init
  apply();
  startAutoplay();
})();




// Testimonial Functionality ends here

// Advantage Slider FUNCTIONALITY Starts here

const viewport = document.getElementById("challenges-viewport");
const track = document.getElementById("challenges-track");
const slides = track ? Array.from(track.querySelectorAll(".challenges-slide")) : [];
const prevBtn = document.querySelector(".challenges__btn--prev");
const nextBtn = document.querySelector(".challenges__btn--next");
const dots = Array.from(document.querySelectorAll(".challenges__dot"));

if (!viewport || !track || slides.length === 0) {
  console.warn("[challenges] Missing required DOM nodes.");
}

const AUTOPLAY_INTERVAL = 2000;    
const HOVER_PAUSE = true;
const FOCUS_PAUSE = true;
const INVIEW_THRESHOLD = 0.5;       

let currentIndex = 0;
let autoplayTimer = null;
let inView = false;                 

function nextIndex() { return (currentIndex + 1) % slides.length; }
function prevIndex() { return (currentIndex - 1 + slides.length) % slides.length; }

// Core nav
function goToSlide(index) {
  if (!slides.length) return;
  currentIndex = (index + slides.length) % slides.length;  // wrap
  const left = slides[currentIndex].offsetLeft;
  viewport.scrollTo({ left, behavior: "smooth" });
  updateUI();
}

function updateUI() {
  dots.forEach((d, i) => d.classList.toggle("active", i === currentIndex));
}

function syncToNearest() {
  const x = viewport.scrollLeft;
  let nearest = 0, best = Infinity;
  for (let i = 0; i < slides.length; i++) {
    const dist = Math.abs(slides[i].offsetLeft - x);
    if (dist < best) { best = dist; nearest = i; }
  }
  if (nearest !== currentIndex) {
    currentIndex = nearest;
    updateUI();
    resetAutoplay();
    
  }
}

// Autoplay controls
function startAutoplay() {
  if (!slides.length || autoplayTimer || !inView) return;
  autoplayTimer = setInterval(() => {
    goToSlide(nextIndex());
  }, AUTOPLAY_INTERVAL);
}

function stopAutoplay() {
  if (autoplayTimer) {
    clearInterval(autoplayTimer);
    autoplayTimer = null;
  }
}

function resetAutoplay() {
  stopAutoplay();
  startAutoplay();
}

// Events: arrows, dots
if (prevBtn) prevBtn.addEventListener("click", () => { goToSlide(prevIndex()); resetAutoplay(); });
if (nextBtn) nextBtn.addEventListener("click", () => { goToSlide(nextIndex()); resetAutoplay(); });
dots.forEach((dot, i) => dot.addEventListener("click", () => { goToSlide(i); resetAutoplay(); }));


viewport.addEventListener("scroll", syncToNearest);


viewport.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") { e.preventDefault(); goToSlide(nextIndex()); resetAutoplay(); }
  if (e.key === "ArrowLeft")  { e.preventDefault(); goToSlide(prevIndex()); resetAutoplay(); }
});


if (HOVER_PAUSE) {
  viewport.addEventListener("mouseenter", stopAutoplay);
  viewport.addEventListener("mouseleave", () => { if (inView) startAutoplay(); });
}
if (FOCUS_PAUSE) {
  viewport.addEventListener("focusin", stopAutoplay);
  viewport.addEventListener("focusout", () => { if (inView) startAutoplay(); });
}


document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopAutoplay();
  else if (inView) startAutoplay();
});


window.addEventListener("resize", () => goToSlide(currentIndex));


const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      inView = entry.isIntersecting && entry.intersectionRatio >= INVIEW_THRESHOLD;
      if (inView) startAutoplay();
      else stopAutoplay();
    });
  },
  { threshold: INVIEW_THRESHOLD }
);

// Kickoff
updateUI();
observer.observe(viewport);


// Advantaged slider functionality ends here



// js code for the whydflip section

(function () {
const root  = document.querySelector('[data-cards]');
if (!root) return;

const track = root.querySelector('[data-track]');
const prev  = root.querySelector('[data-prev]');
const next  = root.querySelector('[data-next]');
if (!track || !prev || !next) return;

const AUTOPLAY_INTERVAL   = 1500; 
const HOVER_PAUSE         = true;
const FOCUS_PAUSE         = true;
const INVIEW_THRESHOLD    = 0.5;

let autoplayTimer = null;
let inView = false;
let isDown = false, startX = 0, startScroll = 0;

const getCardWidth = () => {
  const first = track.querySelector('.card');
  if (!first) return 300;
  const width = first.getBoundingClientRect().width;
  const gap   = parseFloat(getComputedStyle(track).columnGap || 0);
  return width + gap;
};

const getMaxScroll = () => Math.max(0, track.scrollWidth - track.clientWidth);
const atStart = () => track.scrollLeft <= 2;
const atEnd   = () => track.scrollLeft >= getMaxScroll() - 2;

const scrollByCard = (dir = 1) => {
  track.scrollBy({ left: getCardWidth() * dir, behavior: 'smooth' });
};

const goNext = () => {
  if (atEnd()) {
    track.scrollTo({ left: 0, behavior: 'smooth' });
  } else {
    scrollByCard(1);
  }
};
const goPrev = () => {
  if (atStart()) {
    track.scrollTo({ left: getMaxScroll(), behavior: 'smooth' });
  } else {
    scrollByCard(-1);
  }
};

// Arrows
prev.addEventListener('click', () => { goPrev();  resetAutoplay(); });
next.addEventListener('click', () => { goNext();  resetAutoplay(); });

const updateNavState = () => {
  prev.disabled = false;
  next.disabled = false;
};

track.addEventListener('scroll', updateNavState);
window.addEventListener('resize', updateNavState);
updateNavState();

const start = (clientX) => {
  isDown = true; startX = clientX; startScroll = track.scrollLeft;
  track.classList.add('is-dragging');
  stopAutoplay();
};
const move = (clientX) => {
  if (!isDown) return;
  const dx = clientX - startX;
  track.scrollLeft = startScroll - dx;
};
const end = () => {
  if (!isDown) return;
  isDown = false;
  track.classList.remove('is-dragging');
  if (inView) startAutoplay();
};

track.addEventListener('mousedown', e => start(e.clientX));
track.addEventListener('mousemove', e => move(e.clientX));
track.addEventListener('mouseup', end);
track.addEventListener('mouseleave', end);

track.addEventListener('touchstart', e => start(e.touches[0].clientX), { passive: true });
track.addEventListener('touchmove',  e => move(e.touches[0].clientX),   { passive: true });
track.addEventListener('touchend', end);

function startAutoplay() {
  if (autoplayTimer || !inView) return;
  autoplayTimer = setInterval(goNext, AUTOPLAY_INTERVAL);
}
function stopAutoplay() {
  if (autoplayTimer) {
    clearInterval(autoplayTimer);
    autoplayTimer = null;
  }
}
function resetAutoplay() {
  stopAutoplay();
  startAutoplay();
}

if (HOVER_PAUSE) {
  root.addEventListener('mouseenter', stopAutoplay);
  root.addEventListener('mouseleave', () => { if (inView) startAutoplay(); });
}
if (FOCUS_PAUSE) {
  root.addEventListener('focusin',  stopAutoplay);
  root.addEventListener('focusout', () => { if (inView) startAutoplay(); });
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopAutoplay();
  else if (inView) startAutoplay();
});

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      inView = entry.isIntersecting && entry.intersectionRatio >= INVIEW_THRESHOLD;
      if (inView) startAutoplay();
      else stopAutoplay();
    });
  },
  { threshold: INVIEW_THRESHOLD }
);
observer.observe(root);

// Initial
updateNavState();})();

// Why dFlip section ends here