/* ===== Логика сайта "Башҡортостан" ===== */
const D = window.SITE_DATA;
const $  = (s, p=document) => p.querySelector(s);
const $$ = (s, p=document) => [...p.querySelectorAll(s)];

/* ---------- Роутер ---------- */
const pages = ["home","history","nature","culture","cuisine","people","gallery","quiz"];
function route(){
  let hash = (location.hash || "#home").replace("#","");
  if(!pages.includes(hash)) hash = "home";
  $$(".page").forEach(p => p.classList.remove("active"));
  $("#page-"+hash).classList.add("active");
  $$("[data-nav]").forEach(a => a.classList.toggle("active", a.dataset.nav === hash));
  window.scrollTo({top:0, behavior:"instant"});
  $("#mainNav").classList.remove("open");
  $("#burger").setAttribute("aria-expanded","false");
  document.body.classList.remove("nav-open");
  observeReveal();
}
window.addEventListener("hashchange", route);

/* ---------- Шапка: скролл-прогресс, бургер, тема ---------- */
window.addEventListener("scroll", () => {
  const h = document.documentElement;
  const p = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
  $("#scrollProgress").style.width = (p*100) + "%";
  $("#toTop").classList.toggle("show", h.scrollTop > 600);
}, {passive:true});

$("#burger").addEventListener("click", () => {
  const nav = $("#mainNav");
  nav.classList.toggle("open");
  $("#burger").setAttribute("aria-expanded", nav.classList.contains("open"));
});

$("#toTop").addEventListener("click", () => window.scrollTo({top:0, behavior:"smooth"}));

const themeBtn = $("#themeToggle");
function setTheme(t){
  document.documentElement.dataset.theme = t;
  themeBtn.textContent = t === "dark" ? "☀️" : "🌙";
  localStorage.setItem("bs-theme", t);
}
setTheme(localStorage.getItem("bs-theme") || "light");
themeBtn.addEventListener("click", () =>
  setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));

/* ---------- Появление элементов при скролле ---------- */
let revealObserver;
function observeReveal(){
  revealObserver?.disconnect();
  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add("revealed"); revealObserver.unobserve(e.target); } });
  }, {threshold: .12});
  $$(".reveal").forEach(el => revealObserver.observe(el));
}

/* ---------- Герой: слайд-шоу ---------- */
(function(){
  const slides = $("#heroSlides"), dots = $("#heroDots");
  D.heroSlides.forEach((s, i) => {
    const d = document.createElement("div");
    d.className = "hero-slide" + (i===0 ? " active" : "");
    d.style.backgroundImage = `url('${s.img}')`;
    slides.appendChild(d);
    const dot = document.createElement("button");
    dot.className = "hero-dot" + (i===0 ? " active" : "");
    dot.title = s.caption;
    dot.addEventListener("click", () => show(i));
    dots.appendChild(dot);
  });
  let cur = 0, timer;
  function show(i){
    cur = i;
    $$(".hero-slide", slides).forEach((el,k) => el.classList.toggle("active", k===i));
    $$(".hero-dot", dots).forEach((el,k) => el.classList.toggle("active", k===i));
    clearInterval(timer);
    timer = setInterval(() => show((cur+1) % D.heroSlides.length), 5000);
  }
  timer = setInterval(() => show((cur+1) % D.heroSlides.length), 5000);
})();

/* ---------- Анимированные счётчики ---------- */
function animateCounter(el){
  const target = +el.dataset.target, suffix = el.dataset.suffix || "";
  const fmt = el.dataset.format;
  const t0 = performance.now(), dur = 1600;
  function tick(t){
    const k = Math.min((t - t0)/dur, 1);
    const eased = 1 - Math.pow(1-k, 3);
    let v = Math.round(target * eased);
    if(fmt === "mln") el.textContent = (v/1e6).toFixed(1).replace(".",",") + " млн";
    else if(fmt === "space") el.textContent = v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    else el.textContent = v + suffix;
    if(k < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
const statsObs = new IntersectionObserver(es => es.forEach(e => {
  if(e.isIntersecting){ animateCounter(e.target); statsObs.unobserve(e.target); }
}), {threshold:.4});
$$("#statsRow .stat-num").forEach(el => statsObs.observe(el));

/* ---------- Случайные факты ---------- */
(function(){
  let i = Math.floor(Math.random()*D.facts.length);
  $("#factText").textContent = D.facts[i];
  $("#factBtn").addEventListener("click", () => {
    i = (i + 1 + Math.floor(Math.random()*(D.facts.length-1))) % D.facts.length;
    const p = $("#factText");
    p.style.opacity = 0;
    setTimeout(() => { p.textContent = D.facts[i]; p.style.opacity = 1; }, 220);
  });
})();

/* ---------- Таймлайн ---------- */
(function(){
  const track = $("#timelineTrack");
  D.timeline.forEach((t, i) => {
    const b = document.createElement("button");
    b.className = "timeline-item" + (i===0 ? " active" : "");
    b.innerHTML = `<span class="tl-dot"></span><span class="tl-year">${t.year}</span><span class="tl-title">${t.title}</span>`;
    b.addEventListener("click", () => {
      $$(".timeline-item", track).forEach(x => x.classList.remove("active"));
      b.classList.add("active");
      show(i);
    });
    track.appendChild(b);
  });
  function show(i){
    const t = D.timeline[i];
    const box = $("#timelineDetail");
    box.classList.add("switching");
    setTimeout(() => {
      $("#timelineImg").src = t.img;
      $("#timelineImg").alt = t.title;
      $("#timelineYear").textContent = t.year;
      $("#timelineTitle").textContent = t.title;
      $("#timelineText").textContent = t.text;
      box.classList.remove("switching");
    }, 180);
  }
  show(0);
})();

/* ---------- Интерактивная карта ---------- */
(function(){
  const canvas = $("#mapCanvas");
  D.mapPoints.forEach(pt => {
    const m = document.createElement("button");
    m.className = `map-marker marker-${pt.type}`;
    m.style.left = pt.x + "%";
    m.style.top  = pt.y + "%";
    m.title = pt.name;
    m.innerHTML = `<span class="marker-pulse"></span><span class="marker-label">${pt.name}</span>`;
    m.addEventListener("click", () => {
      $$(".map-marker", canvas).forEach(x => x.classList.remove("selected"));
      m.classList.add("selected");
      const info = $("#mapInfo");
      $(".map-info-empty", info).hidden = true;
      $(".map-info-body", info).hidden = false;
      $("#mapInfoImg").src = pt.img;
      $("#mapInfoImg").alt = pt.name;
      $("#mapInfoTag").textContent = pt.tag;
      $("#mapInfoTitle").textContent = pt.name;
      $("#mapInfoText").textContent = pt.text;
      $("#mapInfoExtra").textContent = pt.extra || "";
      info.scrollIntoView({behavior:"smooth", block:"nearest"});
    });
    canvas.appendChild(m);
  });
})();

/* ---------- Культура: табы ---------- */
$$("#cultureTabs .tab-btn").forEach(btn => btn.addEventListener("click", () => {
  $$("#cultureTabs .tab-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  $$(".tab-panel").forEach(p => p.classList.toggle("active", p.dataset.panel === btn.dataset.tab));
}));

/* ---------- Разговорник ---------- */
(function(){
  const box = $("#phrases");
  D.phrases.forEach(p => {
    const b = document.createElement("div");
    b.className = "phrase-card";
    b.innerHTML = `<span class="phrase-ba">${p.ba}</span><span class="phrase-ru">${p.ru}</span>`;
    box.appendChild(b);
  });
})();

/* ---------- Мелодия курая (Web Audio) ---------- */
$("#kuraiPlay")?.addEventListener("click", () => {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  // пентатоника, характерная для курая
  const notes = [
    [587.33,.6],[523.25,.4],[440,.8],[392,.4],[440,.4],[523.25,.8],
    [587.33,.4],[659.25,.6],[587.33,.4],[523.25,.4],[440,1.2],[0,.3],
    [440,.4],[523.25,.4],[587.33,.6],[523.25,.4],[440,.4],[392,.8],[440,1.4]
  ];
  let t = ctx.currentTime + .05;
  const btn = $("#kuraiPlay");
  btn.disabled = true; btn.textContent = "🎶 Играет…";
  notes.forEach(([f, d]) => {
    if(f === 0){ t += d; return; }
    const o = ctx.createOscillator(), g = ctx.createGain(), fl = ctx.createBiquadFilter();
    o.type = "sine"; o.frequency.value = f;
    fl.type = "lowpass"; fl.frequency.value = 2200;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(.25, t + .04);
    g.gain.exponentialRampToValueAtTime(.001, t + d);
    o.connect(fl).connect(g).connect(ctx.destination);
    o.start(t); o.stop(t + d + .05);
    t += d;
  });
  setTimeout(() => { btn.disabled = false; btn.textContent = "🎵 Послушать мелодию курая"; },
    (t - ctx.currentTime) * 1000);
  setTimeout(() => ctx.close(), (t - ctx.currentTime) * 1000 + 500);
});

/* ---------- Кухня ---------- */
(function(){
  const grid = $("#dishGrid");
  function render(filter){
    grid.innerHTML = "";
    D.dishes.filter(d => filter === "all" || d.cat === filter).forEach(d => {
      const card = document.createElement("button");
      card.className = "dish-card reveal";
      card.innerHTML = d.img
        ? `<img src="${d.img}" alt="${d.name}" loading="lazy"><div class="dish-body"><h3>${d.name}</h3><p>${d.sub}</p></div>`
        : `<div class="dish-noimg ${d.cat}"><span>${{meat:"🍖",drink:"🥛",sweet:"🍯",other:"🥟"}[d.cat]}</span></div>
           <div class="dish-body"><h3>${d.name}</h3><p>${d.sub}</p></div>`;
      card.addEventListener("click", () => openDish(d));
      grid.appendChild(card);
      revealObserver?.observe(card);
    });
  }
  render("all");
  $$("#dishFilters .filter-btn").forEach(b => b.addEventListener("click", () => {
    $$("#dishFilters .filter-btn").forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    render(b.dataset.filter);
  }));

  function openDish(d){
    $("#dishModalImg").hidden = !d.img;
    $("#dishModalImg").src = d.img || "";
    $("#dishModalImg").alt = d.name;
    $("#dishModalTitle").textContent = d.name + " — " + d.sub;
    $("#dishModalText").textContent = d.text;
    $("#dishModal").hidden = false;
    document.body.style.overflow = "hidden";
  }
  $("#dishModalClose").addEventListener("click", closeDish);
  $("#dishModal").addEventListener("click", e => { if(e.target.id === "dishModal") closeDish(); });
  function closeDish(){ $("#dishModal").hidden = true; document.body.style.overflow = ""; }
})();

/* ---------- Люди ---------- */
(function(){
  const grid = $("#peopleGrid");
  D.people.forEach(p => {
    const card = document.createElement("div");
    card.className = "person-card reveal";
    card.innerHTML = `
      ${p.img ? `<img src="${p.img}" alt="${p.name}" loading="lazy">`
              : `<div class="person-noimg">${p.name[0]}</div>`}
      <div class="person-body">
        <h3>${p.name}</h3>
        <span class="person-years">${p.years}</span>
        <p class="person-role">${p.role}</p>
        <p class="person-text">${p.text}</p>
        <button class="person-more">Подробнее ↓</button>
      </div>`;
    const btn = $(".person-more", card);
    card.addEventListener("click", () => {
      card.classList.toggle("open");
      btn.textContent = card.classList.contains("open") ? "Свернуть ↑" : "Подробнее ↓";
    });
    grid.appendChild(card);
    revealObserver?.observe(card);
  });
})();

/* ---------- Галерея + лайтбокс ---------- */
(function(){
  const grid = $("#galleryGrid");
  let shown = D.gallery;
  function render(filter){
    grid.innerHTML = "";
    shown = D.gallery.filter(g => filter === "all" || g.cat === filter);
    shown.forEach((g, i) => {
      const f = document.createElement("button");
      f.className = "gallery-item reveal";
      f.innerHTML = `<img src="${g.img}" alt="${g.cap}" loading="lazy"><span class="gallery-cap">${g.cap}</span>`;
      f.addEventListener("click", () => openLightbox(i));
      grid.appendChild(f);
      revealObserver?.observe(f);
    });
  }
  render("all");
  $$("#galleryFilters .filter-btn").forEach(b => b.addEventListener("click", () => {
    $$("#galleryFilters .filter-btn").forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    render(b.dataset.filter);
  }));

  let idx = 0;
  function openLightbox(i){
    idx = i;
    $("#lbImg").src = shown[i].img;
    $("#lbCaption").textContent = shown[i].cap;
    $("#lightbox").hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeLightbox(){ $("#lightbox").hidden = true; document.body.style.overflow = ""; }
  function step(d){
    idx = (idx + d + shown.length) % shown.length;
    openLightbox(idx);
  }
  $("#lbClose").addEventListener("click", closeLightbox);
  $("#lbPrev").addEventListener("click", () => step(-1));
  $("#lbNext").addEventListener("click", () => step(1));
  $("#lightbox").addEventListener("click", e => { if(e.target.id === "lightbox") closeLightbox(); });
  document.addEventListener("keydown", e => {
    if($("#lightbox").hidden) return;
    if(e.key === "Escape") closeLightbox();
    if(e.key === "ArrowLeft") step(-1);
    if(e.key === "ArrowRight") step(1);
  });
})();

/* ---------- Квиз ---------- */
(function(){
  let i = 0, score = 0, answered = false;
  const BEST_KEY = "bs-quiz-best";
  showBest();

  function showBest(){
    const best = localStorage.getItem(BEST_KEY);
    $("#quizBest").textContent = best !== null ? `🏅 Ваш лучший результат: ${best} из ${D.quiz.length}` : "";
  }

  $("#quizBegin").addEventListener("click", () => {
    i = 0; score = 0;
    $("#quizStart").hidden = true;
    $("#quizResult").hidden = true;
    $("#quizGame").hidden = false;
    render();
  });
  $("#quizRestart").addEventListener("click", () => $("#quizBegin").click());

  function render(){
    answered = false;
    const q = D.quiz[i];
    $("#quizProgressBar").style.width = (i / D.quiz.length * 100) + "%";
    $("#quizProgressText").textContent = `Вопрос ${i+1} из ${D.quiz.length} · Счёт: ${score}`;
    $("#quizQuestion").textContent = q.q;
    $("#quizExplain").hidden = true;
    $("#quizNext").hidden = true;
    const box = $("#quizAnswers");
    box.innerHTML = "";
    q.a.forEach((ans, k) => {
      const b = document.createElement("button");
      b.className = "quiz-answer";
      b.textContent = ans;
      b.addEventListener("click", () => {
        if(answered) return;
        answered = true;
        const right = k === q.c;
        if(right) score++;
        $$(".quiz-answer", box).forEach((x, j) => {
          x.disabled = true;
          if(j === q.c) x.classList.add("correct");
          else if(j === k && !right) x.classList.add("wrong");
        });
        const ex = $("#quizExplain");
        ex.textContent = (right ? "✅ Верно! " : "❌ Не угадали. ") + q.e;
        ex.hidden = false;
        $("#quizNext").hidden = false;
        $("#quizProgressText").textContent = `Вопрос ${i+1} из ${D.quiz.length} · Счёт: ${score}`;
      });
      box.appendChild(b);
    });
  }

  $("#quizNext").addEventListener("click", () => {
    i++;
    if(i < D.quiz.length) render();
    else finish();
  });

  function finish(){
    $("#quizGame").hidden = true;
    $("#quizResult").hidden = false;
    $("#quizScore").textContent = `${score} / ${D.quiz.length}`;
    const pct = score / D.quiz.length;
    let v, t;
    if(pct === 1)  { v = "Башкир из башкир! 🏆"; t = "Идеальный результат! Вы знаете Башкортостан как настоящий земляк — от шиханов до сек-сека."; }
    else if(pct >= .7){ v = "Почти земляк! 🎉"; t = "Отличный результат. Ещё одна поездка в Уфу — и будет максимум."; }
    else if(pct >= .4){ v = "Гость республики 🧭"; t = "Хорошее начало! Прогуляйтесь по разделам «История» и «Природа» и попробуйте снова."; }
    else { v = "Дорога нелегка, но интересна 🐎"; t = "Пора ближе познакомиться с Южным Уралом — начните с интерактивной карты!"; }
    $("#quizVerdict").textContent = v;
    $("#quizVerdictText").textContent = t;
    const best = +(localStorage.getItem(BEST_KEY) ?? -1);
    if(score > best){
      localStorage.setItem(BEST_KEY, score);
      $("#quizVerdictText").textContent += " Новый личный рекорд!";
    }
    showBest();
  }
})();

/* ---------- Старт ---------- */
route();
observeReveal();
