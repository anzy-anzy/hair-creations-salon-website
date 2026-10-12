// Mark JS as active before paint, but only when IntersectionObserver exists —
// this is what lets the CSS (html.js-ready .reveal) safely hide content,
// since we know something will be there to reveal it again.
if('IntersectionObserver' in window){
  document.documentElement.classList.add('js-ready');
}

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Header scroll state ---------- */
  var header = document.querySelector('.site-header');
  function onScroll(){
    if(!header) return;
    if(window.scrollY > 40){ header.classList.add('is-scrolled'); }
    else { header.classList.remove('is-scrolled'); }
  }
  window.addEventListener('scroll', onScroll);
  onScroll();

  /* ---------- Mobile nav toggle ---------- */
  var toggle = document.querySelector('.nav-toggle');
  if(toggle && header){
    toggle.addEventListener('click', function(){
      header.classList.toggle('menu-open');
      header.classList.add('is-scrolled');
    });
    document.querySelectorAll('.nav-links a').forEach(function(link){
      link.addEventListener('click', function(){ header.classList.remove('menu-open'); });
    });
  }

  /* ---------- Scroll-reveal (small entrance animation) ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if(revealEls.length){
    if('IntersectionObserver' in window){
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
      revealEls.forEach(function(el){ io.observe(el); });
      // Failsafe: force-reveal anything still hidden after a few seconds
      // (e.g. an element the observer never got a clean trigger for) so
      // content can never be stuck invisible.
      window.setTimeout(function(){
        revealEls.forEach(function(el){ el.classList.add('is-visible'); });
      }, 4000);
    } else {
      revealEls.forEach(function(el){ el.classList.add('is-visible'); });
    }
  }

  /* ---------- Gallery filter tabs ---------- */
  var tabs = document.querySelectorAll('.gallery-tabs button');
  var items = document.querySelectorAll('.gallery-grid .g-item');
  tabs.forEach(function(tab){
    tab.addEventListener('click', function(){
      tabs.forEach(function(t){ t.classList.remove('active'); });
      tab.classList.add('active');
      var cat = tab.getAttribute('data-filter');
      items.forEach(function(item){
        if(cat === 'all' || item.getAttribute('data-cat') === cat){
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  /* ---------- Lightbox ---------- */
  var lightbox = document.querySelector('.lightbox');
  if(lightbox){
    var lbImg = lightbox.querySelector('img');
    var visibleImgs = [];
    var currentIndex = 0;

    function refreshVisible(){
      visibleImgs = Array.prototype.filter.call(
        document.querySelectorAll('.gallery-grid .g-item img'),
        function(img){ return img.closest('.g-item').style.display !== 'none'; }
      );
    }

    function openAt(img){
      refreshVisible();
      currentIndex = visibleImgs.indexOf(img);
      if(currentIndex === -1){ currentIndex = 0; }
      show();
      lightbox.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
    function show(){
      if(visibleImgs[currentIndex]){
        lbImg.src = visibleImgs[currentIndex].getAttribute('src');
        lbImg.alt = visibleImgs[currentIndex].alt || '';
      }
    }
    function close(){
      lightbox.classList.remove('is-open');
      document.body.style.overflow = '';
    }
    document.querySelectorAll('.gallery-grid .g-item img').forEach(function(img){
      img.addEventListener('click', function(){ openAt(img); });
    });
    var closeBtn = lightbox.querySelector('.lightbox-close');
    var prevBtn = lightbox.querySelector('.lightbox-nav.prev');
    var nextBtn = lightbox.querySelector('.lightbox-nav.next');
    if(closeBtn) closeBtn.addEventListener('click', close);
    lightbox.addEventListener('click', function(e){ if(e.target === lightbox) close(); });
    if(prevBtn) prevBtn.addEventListener('click', function(){
      currentIndex = (currentIndex - 1 + visibleImgs.length) % visibleImgs.length; show();
    });
    if(nextBtn) nextBtn.addEventListener('click', function(){
      currentIndex = (currentIndex + 1) % visibleImgs.length; show();
    });
    document.addEventListener('keydown', function(e){
      if(!lightbox.classList.contains('is-open')) return;
      if(e.key === 'Escape') close();
      if(e.key === 'ArrowRight' && nextBtn) nextBtn.click();
      if(e.key === 'ArrowLeft' && prevBtn) prevBtn.click();
    });
  }

});
