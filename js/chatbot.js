/* ==========================================================================
   Hair Creations Salon & Spa — lightweight FAQ chat widget.

   This is a scripted, keyword-matched assistant, not a live AI model — it
   runs entirely in the browser with no server or API behind it, so it can
   only answer from the fixed set of real facts below. Anything it can't
   match gets a friendly fallback pointing to a phone call, which is always
   accurate. Injects its own markup/CSS hooks so every page only needs one
   <script src="js/chatbot.js"> tag.
   ========================================================================== */

(function () {
  var PHONE_DISPLAY = '(831) 637-2866';
  var PHONE_TEL = 'tel:+18316372866';

  var FAQ = [
    {
      keys: ['hour', 'open', 'close', 'time', 'today', 'tomorrow', 'morning', 'evening'],
      reply: 'Hours can shift with appointments, so the most reliable answer is a quick call. We\'re open by appointment Tuesday–Saturday (confirmed open at 9am Tuesdays), and closed Sunday/Monday. <a href="contact.html">See full hours →</a>'
    },
    {
      keys: ['price', 'cost', 'how much', 'rate', 'fee', 'pricing'],
      reply: 'Pricing depends on hair length, condition and the service you choose, so we don\'t post fixed prices — call or message us at <a href="' + PHONE_TEL + '">' + PHONE_DISPLAY + '</a> and we\'ll give you a free, honest quote.'
    },
    {
      keys: ['service', 'offer', 'menu', 'color', 'highlight', 'balayage', 'cut', 'haircut', 'facial', 'wax', 'makeup', 'bridal', 'wedding'],
      reply: 'We do hair color &amp; highlights, balayage, cuts &amp; styling, bridal &amp; special-occasion hair and makeup, plus facials and waxing in our spa room. <a href="services.html">View the full service menu →</a>'
    },
    {
      keys: ['book', 'appointment', 'schedule', 'reserve'],
      reply: 'Appointments are recommended. The fastest way to book is a call to <a href="' + PHONE_TEL + '">' + PHONE_DISPLAY + '</a> — we\'ll find a time that works and match you with Araceli or a member of her team.'
    },
    {
      keys: ['where', 'location', 'address', 'direction', 'park', 'parking', 'map'],
      reply: 'We\'re at 191 San Felipe Rd, in Fiesta Plaza, Hollister, CA 95023. <a href="contact.html">Get directions →</a>'
    },
    {
      keys: ['wheelchair', 'accessib', 'disab', 'ramp'],
      reply: 'The salon has wheelchair-accessible parking, entrance and restroom.'
    },
    {
      keys: ['pay', 'card', 'cash', 'credit', 'debit', 'klarna', 'afterpay'],
      reply: 'We accept credit and debit cards.'
    },
    {
      keys: ['araceli', 'owner', 'stylist', 'who'],
      reply: 'Araceli is the owner and lead stylist at Hair Creations — she specializes in color, balayage and bridal styling. <a href="about.html">Read more about her →</a>'
    },
    {
      keys: ['review', 'rating', 'good', 'reputation'],
      reply: 'Hair Creations has a 4.9★ rating from 78 Google reviews — clients especially love Araceli\'s color work and attention to detail.'
    },
    {
      keys: ['phone', 'call', 'number', 'contact'],
      reply: 'You can reach us at <a href="' + PHONE_TEL + '">' + PHONE_DISPLAY + '</a>.'
    },
    {
      keys: ['hi', 'hello', 'hey'],
      reply: 'Hi there! I can help with hours, services, pricing, location or booking — what would you like to know?'
    },
    {
      keys: ['thank'],
      reply: 'You\'re so welcome! Anything else I can help with?'
    }
  ];

  var FALLBACK = 'I\'m just a simple assistant, so I may not have caught that — but our team can help with anything. Call or text us at <a href="' + PHONE_TEL + '">' + PHONE_DISPLAY + '</a>, or try one of the quick questions below.';

  var QUICK_REPLIES = [
    { label: 'Hours', query: 'hours' },
    { label: 'Services & pricing', query: 'services and pricing' },
    { label: 'Location & parking', query: 'location' },
    { label: 'Book an appointment', query: 'book an appointment' }
  ];

  function matchReply(text) {
    var t = text.toLowerCase();
    for (var i = 0; i < FAQ.length; i++) {
      var keys = FAQ[i].keys;
      for (var k = 0; k < keys.length; k++) {
        if (t.indexOf(keys[k]) !== -1) { return FAQ[i].reply; }
      }
    }
    return FALLBACK;
  }

  function buildWidget() {
    var wrap = document.createElement('div');
    wrap.innerHTML =
      '<button class="chat-launcher" aria-label="Open chat" type="button">' +
        '<span class="cl-badge"></span>' +
        '<span aria-hidden="true">&#128172;</span>' +
      '</button>' +
      '<div class="chat-window" role="dialog" aria-label="Hair Creations chat assistant">' +
        '<div class="chat-head">' +
          '<div class="ch-title"><strong>Hair Creations</strong><span>Ask us anything</span></div>' +
          '<button class="chat-close" type="button" aria-label="Close chat">&#10005;</button>' +
        '</div>' +
        '<div class="chat-body" id="chatBody"></div>' +
        '<div class="chat-quick" id="chatQuick"></div>' +
        '<form class="chat-foot" id="chatForm">' +
          '<input type="text" id="chatInput" placeholder="Type a question…" autocomplete="off">' +
          '<button type="submit" aria-label="Send">&#10148;</button>' +
        '</form>' +
        '<div class="chat-note">Scripted assistant — for anything else, call ' + PHONE_DISPLAY + '.</div>' +
      '</div>';
    document.body.appendChild(wrap);
  }

  function addMessage(body, text, who) {
    var el = document.createElement('div');
    el.className = 'chat-msg ' + who;
    el.innerHTML = text;
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
  }

  function init() {
    buildWidget();
    var launcher = document.querySelector('.chat-launcher');
    var win = document.querySelector('.chat-window');
    var closeBtn = document.querySelector('.chat-close');
    var body = document.getElementById('chatBody');
    var quick = document.getElementById('chatQuick');
    var form = document.getElementById('chatForm');
    var input = document.getElementById('chatInput');
    var greeted = false;

    QUICK_REPLIES.forEach(function (q) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = q.label;
      btn.addEventListener('click', function () { send(q.query); });
      quick.appendChild(btn);
    });

    function open() {
      win.classList.add('is-open');
      launcher.setAttribute('aria-expanded', 'true');
      if (!greeted) {
        greeted = true;
        addMessage(body, 'Hi! I\'m the Hair Creations assistant. Ask me about hours, services, pricing, location or booking — or tap a question below.', 'bot');
      }
      input.focus();
    }
    function close() {
      win.classList.remove('is-open');
      launcher.setAttribute('aria-expanded', 'false');
    }
    function send(text) {
      text = (text || '').trim();
      if (!text) { return; }
      addMessage(body, text, 'user');
      window.setTimeout(function () {
        addMessage(body, matchReply(text), 'bot');
      }, 280);
    }

    launcher.addEventListener('click', function () {
      if (win.classList.contains('is-open')) { close(); } else { open(); }
    });
    closeBtn.addEventListener('click', close);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      send(input.value);
      input.value = '';
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && win.classList.contains('is-open')) { close(); }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
