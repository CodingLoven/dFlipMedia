document.addEventListener("DOMContentLoaded", () => {
  console.log("Global JS loaded");

  if (document.body.classList.contains("home-page")) {
    console.log("Homepage scripts running");

    // Testimonial Functionality starts here

    (function () {
      const root = document.querySelector('.sec8');
      if (!root) return;

      const mediaTrack = root.querySelector('.sec8-media-track');
      const reviewTrack = root.querySelector('.sec8-review-track');
      const count = root.querySelectorAll('.sec8-review-slide').length;

      const prevBtn = root.querySelector('.sec8-prev');
      const nextBtn = root.querySelector('.sec8-next');
      const dots = Array.from(root.querySelectorAll('.sec8-dot'));

      const videos = () => Array.from(root.querySelectorAll('.sec8-video'));
      const plays = () => Array.from(root.querySelectorAll('.sec8-play'));

      const AUTOPLAY_INTERVAL = 2000;
      const INVIEW_THRESHOLD = 0.5;

      let index = 0;
      let autoplayTimer = null;
      let inView = false;
      let videoPlaying = false;
      let startX = 0, currentX = 0, isDragging = false;

        function apply() {
          const t = `translateX(-${index * 100}%)`;
          mediaTrack.style.transform = t;
          reviewTrack.style.transform = t;

          dots.forEach((d, i) => d.classList.toggle('is-active', i === index));

          const vs = videos();
          const ps = plays();

          vs.forEach((v, i) => {
            if (i !== index && !v.paused) v.pause();
            if (i !== index) v.removeAttribute('controls');
          });

          ps.forEach((btn, i) => {
            const v = vs[i];
            if (i === index) {
              btn.style.opacity = v.paused ? '1' : '0';
              btn.style.pointerEvents = v.paused ? 'auto' : 'none';
            } else {
              btn.style.opacity = '1';
              btn.style.pointerEvents = 'auto';
            }
          });
        }

        function go(step) {
          index = (index + step + count) % count;
          apply();
        }

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

        prevBtn?.addEventListener('click', () => { go(-1); resetAutoplay(); });
        nextBtn?.addEventListener('click', () => { go(1); resetAutoplay(); });
        dots.forEach((d, i) => d.addEventListener('click', () => { index = i; apply(); resetAutoplay(); }));

        // Play button click
        root.addEventListener('click', e => {
          const btn = e.target.closest('.sec8-play');
          if (!btn) return;
          const v = btn.parentElement.querySelector('.sec8-video');
          btn.style.opacity = '0';
          btn.style.pointerEvents = 'none';
          v.setAttribute('controls', '');
          v.play();
        });

        // Pause autoplay while video plays; resume after
        videos().forEach((v, i) => {
          v.addEventListener('play', () => {
            videoPlaying = true;
            stopAutoplay();
            v.setAttribute('controls', '');
            const btn = v.parentElement.querySelector('.sec8-play');
            btn.style.opacity = '0';
            btn.style.pointerEvents = 'none';
          });

          const restore = () => {
            videoPlaying = false;
            const btn = v.parentElement.querySelector('.sec8-play');
            if (i === index) {
              btn.style.opacity = '1';
              btn.style.pointerEvents = 'auto';
            }
            v.removeAttribute('controls');
            startAutoplay();
          };

          v.addEventListener('pause', restore);
          v.addEventListener('ended', restore);
        });

        // Touch swipe for mobile
        function handleTouchStart(e) {
          startX = e.touches ? e.touches[0].clientX : e.clientX;
          isDragging = true;
          stopAutoplay();
        }

        function handleTouchMove(e) {
          if (!isDragging) return;
          currentX = e.touches ? e.touches[0].clientX : e.clientX;
        }

        function handleTouchEnd() {
          if (!isDragging) return;
          const diff = startX - currentX;
          if (Math.abs(diff) > 50) go(diff > 0 ? 1 : -1);
          isDragging = false;
          resetAutoplay();
        }

        root.addEventListener('touchstart', handleTouchStart, { passive: true });
        root.addEventListener('touchmove', handleTouchMove, { passive: true });
        root.addEventListener('touchend', handleTouchEnd);
        root.addEventListener('mousedown', handleTouchStart);
        root.addEventListener('mousemove', handleTouchMove);
        root.addEventListener('mouseup', handleTouchEnd);
        root.addEventListener('mouseleave', () => isDragging = false);

        // In-view observer
        const observer = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            inView = entry.isIntersecting && entry.intersectionRatio >= INVIEW_THRESHOLD;
            if (inView) startAutoplay(); else stopAutoplay();
          });
        }, { threshold: INVIEW_THRESHOLD });
        observer.observe(root);

        document.addEventListener('visibilitychange', () => {
          if (document.hidden) stopAutoplay();
          else startAutoplay();
        });

        window.addEventListener('resize', apply);

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
      currentIndex = (index + slides.length) % slides.length;  
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

      updateNavState();
    })();
    // Why dFlip section ends here

   
  }


  if (document.body.classList.contains("about-page")) {
    console.log("About page scripts running");

    const accordionItems = document.querySelectorAll(".accordion-item");
    accordionItems.forEach((item) => {
    const header = item.querySelector(".accordion-header");
    const icon = item.querySelector(".accordion-icon");
    const body = item.querySelector(".accordion-body");

    header.addEventListener("click", () => {
      const isActive = item.classList.contains("active");

      // Close all items
      accordionItems.forEach((otherItem) => {
        otherItem.classList.remove("active");
        otherItem.querySelector(".accordion-header").setAttribute("aria-expanded", "false");
        otherItem.querySelector(".accordion-icon").textContent = "+";
        otherItem.querySelector(".accordion-body").style.maxHeight = null;
      });

      // Toggle the clicked item
      if (!isActive) {
        item.classList.add("active");
        header.setAttribute("aria-expanded", "true");
        icon.textContent = "−";
        body.style.maxHeight = body.scrollHeight + "px";
      } else {
        item.classList.remove("active");
        header.setAttribute("aria-expanded", "false");
        icon.textContent = "+";
        body.style.maxHeight = null;
      }
    });
  });
  }


  if (document.body.classList.contains("services-page")) {
    console.log("services page scripts running");

    const tabs = document.querySelectorAll(".tab-card");
    const panels = document.querySelectorAll(".pill-panel");
    const pills = document.querySelectorAll(".pill");
    const serviceDetail = document.getElementById("service-detail");

    let activeTab = 0;
    let activePill = null;
    let autoCycleInterval = null;
    let autoCycling = true;

    /** Activate a Tab **/
    function activateTab(index, isAuto = false) {
      tabs.forEach((t, i) => t.classList.toggle("is-active", i === index));
      panels.forEach((p, i) => p.classList.toggle("is-visible", i === index));
      activeTab = index;

      // Only auto-select the first pill if this was triggered by a user, not by the auto cycle
      if (!isAuto) {
        const visiblePanel = panels[index];
        const firstPill = visiblePanel.querySelector(".pill");
        if (firstPill) activatePill(firstPill);
      }
    }

    /** Activate a Pill **/
    function activatePill(pill) {
      const serviceKey = pill.dataset.service;
      const template = document.querySelector(`#tmpl-service-${serviceKey}`);
      if (!template) return;

      // Instantly activate pill
      pills.forEach(p => p.classList.remove("is-active", "pill-clicked"));
      pill.classList.add("is-active", "pill-clicked");
      activePill = pill;

      // Remove pulse very fast
      setTimeout(() => pill.classList.remove("pill-clicked"), 80);

      // Defer content change slightly to avoid layout blocking
      requestAnimationFrame(() => {
        const content = template.content.cloneNode(true);
        serviceDetail.innerHTML = "";
        serviceDetail.appendChild(content);

        // small async for animation reflow
        setTimeout(() => {
          serviceDetail.classList.remove("fade-in");
          void serviceDetail.offsetWidth;
          serviceDetail.classList.add("fade-in");
        }, 20);
      });
    }

    /** Handle URL Hash for Deep Linking **/
    function handleDeepLink() {
      const hash = window.location.hash.replace("#", "");
      if (!hash) return;
      const pill = document.querySelector(`[data-service="${hash}"]`);
      if (pill) {
        const parentPanel = pill.closest(".pill-panel");
        const tabIndex = [...panels].indexOf(parentPanel);
        if (tabIndex >= 0) activateTab(tabIndex);
        activatePill(pill);
        stopAutoCycle();
        pill.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }

    /** Start Automatic Cycle Through Pills **/
    function startAutoCycle() {
      if (!autoCycling) return;
      const allPills = Array.from(document.querySelectorAll(".pill"));
      let currentIndex = 0;

      clearInterval(autoCycleInterval);
      autoCycleInterval = setInterval(() => {
        if (!autoCycling) return;

        const pill = allPills[currentIndex];
        const panel = pill.closest(".pill-panel");
        const tabIndex = [...panels].indexOf(panel);

        // Activate tab & pill — mark that this is auto
        activateTab(tabIndex, true);
        activatePill(pill);

        // Move to next pill
        currentIndex = (currentIndex + 1) % allPills.length;
      }, 5000);
    }

    /** Stop Auto Cycling **/
    function stopAutoCycle() {
      autoCycling = false;
      clearInterval(autoCycleInterval);
    }

    /** Event Listeners **/
    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => {
        stopAutoCycle();
        activateTab(i);
      });
    });

    pills.forEach(pill => {
      pill.addEventListener("click", () => {
        stopAutoCycle();
        activatePill(pill);
      });
    });

    /** Initial Setup **/
    activateTab(0);
    startAutoCycle();
    handleDeepLink();

    /** Pause Animation When Section is Not in View **/
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && autoCycling) startAutoCycle();
        else clearInterval(autoCycleInterval);
      });
    }, { threshold: 0.1 });

    observer.observe(document.querySelector(".sec1.services-showcase"));
  }

  



























  // Scroll reveal effect (RUNS ON ALL PAGES)
 
  const reveals = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15
    }
  );

  reveals.forEach(el => revealObserver.observe(el));
});
