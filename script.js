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

    // vertical scroll tabbed inner section js
    (function () {
      const section = document.querySelector('.services-scroll-section');
      if (!section) return;

      const mainButtons = section.querySelectorAll('.services-main-btn');
      const navLists = section.querySelectorAll('.services-scroll-list');
      const contentGroups = section.querySelectorAll('.services-scroll-inner');


      // Utility helpers

      function getActiveGroup() {
        return section.querySelector('.services-main-btn.active')?.dataset.main;
      }

      function getNavList(group) {
        return section.querySelector(`.services-scroll-list[data-group="${group}"]`);
      }

      function getContentGroup(group) {
        return section.querySelector(`.services-scroll-inner[data-group="${group}"]`);
      }

      // SCROLL SYNC 

      function setupScrollSync(group) {
        const navList = getNavList(group);
        const content = getContentGroup(group);
        if (!navList || !content) return;

        const navItems = navList.querySelectorAll('li');
        const serviceItems = content.querySelectorAll('.services-scroll-item');

        // reset active state
        navItems.forEach(li => li.classList.remove('active'));
        if (navItems[0]) navItems[0].classList.add('active');

        content.addEventListener('scroll', () => {
          let activeIndex = 0;

          serviceItems.forEach((item, index) => {
            const rect = item.getBoundingClientRect();
            const containerRect = content.getBoundingClientRect();

            if (rect.top - containerRect.top < containerRect.height / 2) {
              activeIndex = index;
            }
          });

          navItems.forEach(li => li.classList.remove('active'));
          if (navItems[activeIndex]) {
            navItems[activeIndex].classList.add('active');
          }
        });

        // click → scroll
        navItems.forEach((li, index) => {
          li.addEventListener('click', () => {
            serviceItems[index].scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          });
        });
      }


      function switchGroup(group) {
        // toggle nav lists
        navLists.forEach(list => {
          list.classList.toggle('is-hidden', list.dataset.group !== group);
        });

        // toggle content panels
        contentGroups.forEach(panel => {
          panel.classList.toggle('is-hidden', panel.dataset.group !== group);
          if (panel.dataset.group === group) {
            panel.scrollTop = 0;
          }
        });

        setupScrollSync(group);
      }


      mainButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          if (btn.classList.contains('active')) return;

          mainButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          switchGroup(btn.dataset.main);
        });
      });

      const initialGroup = getActiveGroup() || 'brand-promotion';
      switchGroup(initialGroup);

    })();
  
    
    // Popup form js

    (function () {
      const modal = document.getElementById('quoteModal');
      const closeBtn = modal.querySelector('.quote-modal-close');
      const overlay = modal;

      const mainServiceEl = document.getElementById('quoteMainService');
      const subServiceEl = document.getElementById('quoteSubService');

      // open modal
      document.addEventListener('click', function (e) {
        const cta = e.target.closest('.services-scroll-cta');
        if (!cta) return;

        e.preventDefault();

        // find context
        const activeMain = document.querySelector('.services-main-btn.active')?.textContent;
        const activeSub = document.querySelector('.services-scroll-list:not(.is-hidden) li.active')?.textContent;

        mainServiceEl.textContent = activeMain || '—';
        subServiceEl.textContent = activeSub || '—';

        modal.classList.add('is-open');
        document.body.style.overflow = 'hidden';
      });

      // close modal
      function closeModal() {
        modal.classList.remove('is-open');
        document.body.style.overflow = '';
      }

      closeBtn.addEventListener('click', closeModal);
      overlay.addEventListener('click', e => {
        if (e.target === overlay) closeModal();
      });
    })();


    
  }


  if (!document.body.classList.contains("contact-page")) {
    console.log("Contacts page scripts running");

    document.querySelectorAll('.faq-question').forEach(button => {
      button.addEventListener('click', () => {
        const item = button.parentElement;
        const isOpen = item.classList.contains('active');

        document.querySelectorAll('.faq-item').forEach(i => {
          i.classList.remove('active');
        });

        if (!isOpen) {
          item.classList.add('active');
        }
      });
    })
  }


    

  // form get js tbcom with namecheap php ...file

  // const form = document.getElementById('quoteForm');

  // form.addEventListener('submit', async (e) => {
  //   e.preventDefault();

  //   const data = new FormData(form);

  //   try {
  //     const response = await fetch('/api/send-quote.php', {
  //       method: 'POST',
  //       body: data
  //     });

  //     const result = await response.json();

  //     if (result.success) {
  //       form.innerHTML = `
  //         <p><strong>Thank you!</strong></p>
  //         <p>Your request has been sent.</p>
  //       `;
  //     } else {
  //       alert('Something went wrong. Please try again.');
  //     }
  //   } catch (err) {
  //     alert('Form not connected yet.');
  //   }
  // });

  



























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


  // Get Year script
  document.getElementById("year").textContent = new Date().getFullYear();
});
