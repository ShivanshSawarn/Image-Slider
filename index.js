 // ─ Configuration ─
    const INTERVAL   = 3500;   // ms between auto-slides
    const TOTAL      = 5;      // total number of slides
 
    // ─ DOM References ─
    const track       = document.getElementById('slidesTrack');
    const dotsWrap    = document.getElementById('dots');
    const counter     = document.getElementById('slideCounter');
    const progressBar = document.getElementById('progressBar');
    const btnPause    = document.getElementById('btnPause');
    const btnPrev     = document.querySelector('.btn-prev');
    const btnNext     = document.querySelector('.btn-next');
 
    // ─ State ─
    let current    = 0;
    let isPlaying  = true;
    let timer      = null;
    let progTimer  = null;
    let progStart  = null;
 
    // ─ Build Dots ─
    for (let i = 0; i < TOTAL; i++) {
      const dot = document.createElement('button');
      dot.classList.add('dot');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    }
 
    const dots = () => dotsWrap.querySelectorAll('.dot');
 
    // ─ Core: Go To Slide ─
    function goTo(index) {
      current = (index + TOTAL) % TOTAL;
      track.style.transform = `translateX(-${current * 100}%)`;
 
      // Update dots
      dots().forEach((d, i) => d.classList.toggle('active', i === current));
 
      // Update counter
      counter.textContent = `${current + 1} / ${TOTAL}`;
 
      // Restart progress if playing
      if (isPlaying) restartProgress();
    }
 
    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }
 
    // ─ Auto-Slide Timer ─
    function startTimer() {
      clearInterval(timer);
      timer = setInterval(next, INTERVAL);
    }
 
    function stopTimer() {
      clearInterval(timer);
      clearAnimationFrame();
    }
 
    // ── Progress Bar Animation ─────────────────────────────────────
    let rafId = null;
 
    function clearAnimationFrame() {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    }
 
    function restartProgress() {
      clearAnimationFrame();
      progressBar.style.transition = 'none';
      progressBar.style.width = '0%';
 
      progStart = performance.now();
      startTimer();
 
      rafId = requestAnimationFrame(animateProgress);
    }
 
    function animateProgress(now) {
      const elapsed  = now - progStart;
      const pct      = Math.min((elapsed / INTERVAL) * 100, 100);
      progressBar.style.transition = 'none';
      progressBar.style.width = pct + '%';
      if (pct < 100) {
        rafId = requestAnimationFrame(animateProgress);
      }
    }
 
    // ─ Pause / Play ─
    function pause() {
      isPlaying = false;
      stopTimer();
      progressBar.style.width = '0%';
      btnPause.textContent = 'Play';
    }
 
    function play() {
      isPlaying = true;
      btnPause.textContent = 'Pause';
      restartProgress();
    }
 
    btnPause.addEventListener('click', () => isPlaying ? pause() : play());
 
    // ─ Navigation Buttons ─
    btnNext.addEventListener('click', () => { goTo(current + 1); if (isPlaying) restartProgress(); });
    btnPrev.addEventListener('click', () => { goTo(current - 1); if (isPlaying) restartProgress(); });
 
    // ─ Keyboard Navigation ─
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') btnNext.click();
      if (e.key === 'ArrowLeft')  btnPrev.click();
      if (e.key === ' ')          btnPause.click();
    });
 
    // ─ Touch / Swipe Support ─
    let touchStartX = 0;
    const sliderEl  = document.getElementById('slider');
 
    sliderEl.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
 
    sliderEl.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 40) {
        diff > 0 ? btnNext.click() : btnPrev.click();
      }
    }, { passive: true });
 
    // ─ Init ─
    restartProgress();