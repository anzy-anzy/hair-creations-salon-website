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

  /* ---------- Gallery label tiles (jump to a filtered view) ----------
     The plain-text cells interspersed in the gallery grid act as
     shortcuts into a filter tab rather than a separate page, since
     this is a single-location gallery, not a multi-location site. */
  document.querySelectorAll('[data-filter-link]').forEach(function(el){
    el.addEventListener('click', function(e){
      e.preventDefault();
      var cat = el.getAttribute('data-filter-link');
      var matchingTab = document.querySelector('.gallery-tabs button[data-filter="' + cat + '"]');
      if(matchingTab){ matchingTab.click(); }
      var tabsEl = document.querySelector('.gallery-tabs');
      if(tabsEl){ tabsEl.scrollIntoView({ behavior:'smooth', block:'start' }); }
    });
  });

  /* ---------- Booking request form ----------
     No backend on this static site, so there is no live calendar to
     reserve a slot in. Instead this composes the client's picks into a
     text message addressed to the salon's real number, with a phone
     fallback always shown — an honest substitute, not a fake
     "confirmed" booking. */
  var bookForm = document.getElementById('booking-form');
  if(bookForm){
    var dateInput = document.getElementById('book-date');
    if(dateInput){
      var today = new Date();
      var yyyy = today.getFullYear();
      var mm = String(today.getMonth() + 1).padStart(2, '0');
      var dd = String(today.getDate()).padStart(2, '0');
      dateInput.setAttribute('min', yyyy + '-' + mm + '-' + dd);
    }
    bookForm.addEventListener('submit', function(e){
      e.preventDefault();
      if(!bookForm.reportValidity()) return;

      var service = document.getElementById('book-service').value;
      var dateVal = document.getElementById('book-date').value;
      var timeVal = document.getElementById('book-time').value;
      var name = document.getElementById('book-name').value.trim();
      var phone = document.getElementById('book-phone').value.trim();
      var notes = document.getElementById('book-notes').value.trim();

      var dateStr = dateVal;
      if(dateVal){
        var d = new Date(dateVal + 'T00:00:00');
        dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
      }
      var timeStr = timeVal;
      if(timeVal){
        var parts = timeVal.split(':');
        var h = parseInt(parts[0], 10);
        var m = parts[1];
        var ampm = h >= 12 ? 'PM' : 'AM';
        var h12 = h % 12; if(h12 === 0) h12 = 12;
        timeStr = h12 + ':' + m + ' ' + ampm;
      }

      var lines = [
        "Hi! I'd like to request an appointment at Hair Creations.",
        'Service: ' + service,
        'Preferred date: ' + dateStr,
        'Preferred time: ' + timeStr,
        'Name: ' + name,
        'Phone: ' + phone
      ];
      if(notes){ lines.push('Notes: ' + notes); }
      var message = lines.join('\n');

      var smsLink = 'sms:+18316372866?&body=' + encodeURIComponent(message);
      var smsBtn = document.getElementById('book-sms-link');
      if(smsBtn){ smsBtn.setAttribute('href', smsLink); }
      var summary = document.getElementById('book-summary');
      if(summary){ summary.textContent = message; }

      var confirmBox = document.getElementById('book-confirm');
      if(confirmBox){
        confirmBox.hidden = false;
        confirmBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

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
