// Small utilities: debounce and simple swipe detection.
// Place at assets/js/ux.js and ensure index.html includes it before main.js.

window.ux = (function () {
  function debounce(fn, wait = 200) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  // Simple swipe detection: attaches to an element and calls handlers
  function attachSwipe(el, { onLeft = () => {}, onRight = () => {}, threshold = 40 } = {}) {
    if (!el) return () => {};
    let startX = null;
    let startY = null;
    let moved = false;

    function onTouchStart(e) {
      const t = e.touches ? e.touches[0] : e;
      startX = t.clientX;
      startY = t.clientY;
      moved = false;
    }

    function onTouchMove(e) {
      moved = true;
    }

    function onTouchEnd(e) {
      if (!moved || startX === null) return;
      const t = (e.changedTouches && e.changedTouches[0]) || e;
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      // ignore mostly vertical swipes
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > threshold) {
        if (dx < 0) onLeft();
        else onRight();
      }
      startX = startY = null;
      moved = false;
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    // mouse support for desktop gestures (optional)
    el.addEventListener('mousedown', onTouchStart);
    el.addEventListener('mouseup', onTouchEnd);

    return function detach() {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('mousedown', onTouchStart);
      el.removeEventListener('mouseup', onTouchEnd);
    };
  }

  return { debounce, attachSwipe };
})();
