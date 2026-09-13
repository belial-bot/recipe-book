/* ==========================================================================
   Recipe page — renders one recipe from its data object.
   ========================================================================== */

(function () {
  "use strict";

  var RB = window.RB;
  var R = null;          // the current recipe
  var servings = 0;      // live yield, drives ingredient scaling

  function qs(name) {
    var m = new RegExp("[?&]" + name + "=([^&]*)").exec(location.search);
    return m ? decodeURIComponent(m[1].replace(/\+/g, " ")) : "";
  }

  /* --- hero ----------------------------------------------------------------
     Every image in the recipe belongs to the header. One photo is a still
     header; two or more turn it into a carousel that advances on its own.
     `images[0]` stays the cover everywhere else (overview card, lightbox
     entry point), so the first entry is still the one that matters most.
     -------------------------------------------------------------------- */

  var slide = 0;             // index of the visible header image
  var autoTimer = null;
  var autoHeld = false;      // pointer or keyboard focus is resting on the header
  var AUTO_MS = 6000;        // a slow, readable cadence — nobody is browsing here

  function renderHero() {
    var hero = document.getElementById("hero");
    var imgs = R.images;
    var hasPhoto = imgs.length > 0;
    var many = imgs.length > 1;

    hero.className = "rhero " + (hasPhoto ? "rhero--photo" : "rhero--flat");

    // Only the category, so the label matches the filter buttons on the
    // overview exactly. Tags stay searchable but are not shown here.
    var eyebrow = R.category || "";

    // Each slide wraps its image, so a broken path can be swapped for the
    // drawn placeholder without the carousel losing track of the slide.
    var mediaHTML = hasPhoto
      ? '<div class="rhero__media">' + imgs.map(function (src, i) {
          return '<div class="rhero__slide' + (i === 0 ? " is-on" : "") + '">' +
            '<img src="' + RB.esc(src) + '" alt="" data-fallback="' + RB.esc(R.title) +
            '" decoding="async"' + (i === 0 ? "" : ' loading="lazy"') + "></div>";
        }).join("") + "</div>" + '<div class="rhero__scrim"></div>'
      : "";

    var dotsHTML = many
      ? '<div class="rhero__dots">' + imgs.map(function (_, i) {
          return '<button type="button" class="rhero__dot' + (i === 0 ? " is-on" : "") +
            '" data-go="' + i + '" aria-label="' +
            RB.t.imageGo.replace("%s", i + 1) + '" aria-current="' + (i === 0) + '"></button>';
        }).join("") + "</div>"
      : "";

    var controlsHTML = hasPhoto
      ? '<div class="rhero__controls">' +
          (many
            ? '<button type="button" class="rhero__nav rhero__nav--prev" data-step="-1" ' +
                'aria-label="' + RB.t.imagePrev + '">‹</button>' +
              '<button type="button" class="rhero__nav rhero__nav--next" data-step="1" ' +
                'aria-label="' + RB.t.imageNext + '">›</button>'
            : "") +
          '<button type="button" class="rhero__zoom" aria-label="' + RB.t.imageZoom + '">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
              'stroke-linecap="round" aria-hidden="true">' +
              '<path d="M14 4h6v6M20 4l-7 7M10 20H4v-6M4 20l7-7"/></svg>' +
          "</button>" + dotsHTML +
        "</div>"
      : "";

    hero.innerHTML = mediaHTML +
      '<div class="rhero__inner">' +
        (eyebrow ? '<span class="rhero__eyebrow tag-label">' + RB.esc(eyebrow) + "</span>" : "") +
        '<div class="rhero__row">' +
          '<h1 class="rhero__title">' + RB.esc(R.title) + "</h1>" +
          RB.starHTML(R.slug, "fav--hero") +
        "</div>" +
        (R.subtitle ? '<p class="rhero__sub">' + RB.esc(R.subtitle) + "</p>" : "") +
      "</div>" + controlsHTML;

    RB.wireImageFallbacks(hero);
    if (hasPhoto) wireCarousel(hero);
    if (hasPhoto && !RB.reducedMotion) parallax(hero.querySelector(".rhero__media"));
  }

  function wireCarousel(hero) {
    hero.addEventListener("click", function (e) {
      var nav = e.target.closest(".rhero__nav");
      if (nav) return goSlide(slide + Number(nav.dataset.step), true);
      var dot = e.target.closest(".rhero__dot");
      if (dot) return goSlide(Number(dot.dataset.go), true);
      if (e.target.closest(".rhero__zoom")) openLightbox(slide);
    });

    if (R.images.length < 2) return;

    // Swipe, because on a phone that is how everyone tries it first.
    var startX = 0, startY = 0, tracking = false;
    hero.addEventListener("touchstart", function (e) {
      if (e.touches.length !== 1) return;
      tracking = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });
    hero.addEventListener("touchend", function (e) {
      if (!tracking) return;
      tracking = false;
      var t = e.changedTouches[0];
      var dx = t.clientX - startX;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(t.clientY - startY)) {
        goSlide(slide + (dx < 0 ? 1 : -1), true);
      }
    }, { passive: true });

    // Hold still while it is being looked at, or while the tab is away. The
    // hold outlives a click on the arrows, so working through the images by
    // hand doesn't hand control back mid-look.
    ["mouseenter", "focusin"].forEach(function (ev) {
      hero.addEventListener(ev, function () { autoHeld = true; stopAuto(); });
    });
    ["mouseleave", "focusout"].forEach(function (ev) {
      hero.addEventListener(ev, function () { autoHeld = false; startAuto(); });
    });
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "visible") startAuto(); else stopAuto();
    });

    startAuto();
  }

  function goSlide(i, manual) {
    var n = R.images.length;
    if (n < 2) return;
    slide = (i % n + n) % n;

    document.querySelectorAll(".rhero__slide").forEach(function (el, k) {
      el.classList.toggle("is-on", k === slide);
    });
    document.querySelectorAll(".rhero__dot").forEach(function (el, k) {
      el.classList.toggle("is-on", k === slide);
      el.setAttribute("aria-current", String(k === slide));
    });

    if (manual) startAuto();          // a tap buys a fresh full interval
  }

  function startAuto() {
    stopAuto();
    if (R.images.length < 2 || RB.reducedMotion) return;
    if (autoHeld || document.visibilityState === "hidden") return;
    autoTimer = setInterval(function () { goSlide(slide + 1, false); }, AUTO_MS);
  }

  function stopAuto() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  }

  /* The hero image drifts at roughly a third of scroll speed. */
  function parallax(media) {
    if (!media) return;
    var ticking = false;
    function frame() {
      var hero = media.closest(".rhero");
      var limit = (hero ? hero.offsetHeight : 500) * 0.11;   // the -12% overhang
      var shift = Math.min(window.scrollY * 0.28, limit);
      media.style.transform = "translate3d(0," + shift.toFixed(1) + "px,0)";
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(frame); }
    }, { passive: true });
    frame();
  }

  /* --- meta rail ---------------------------------------------------------- */

  function renderRail() {
    var t = R.times || {};
    var cells = [];
    if (t.prep) cells.push([RB.t.prep, RB.formatMinutes(t.prep)]);
    if (t.cook) cells.push([RB.t.cook, RB.formatMinutes(t.cook)]);
    if (t.rest) cells.push([RB.t.rest, RB.formatMinutes(t.rest)]);
    if (R._total) cells.push([RB.t.total, RB.formatMinutes(R._total)]);
    if (R.difficulty) cells.push([RB.t.level, R.difficulty]);

    var rail = document.getElementById("rail");
    if (!cells.length) { rail.remove(); return; }

    rail.innerHTML = '<div class="rail__inner">' + cells.map(function (c) {
      return '<div class="rail__cell"><span class="rail__k">' + RB.esc(c[0]) +
        '</span><span class="rail__v">' + RB.esc(c[1]) + "</span></div>";
    }).join("") + "</div>";
  }

  /* --- ingredients + the yield scaler (the signature interaction) ---------- */

  function renderIngredients() {
    var box = document.getElementById("ingredients");
    if (!R.ingredients.length) { box.remove(); return; }

    var scalable = R.servings > 0;
    servings = R.servings;

    var yieldHTML = scalable
      ? '<div class="yield">' +
          '<span class="yield__label">' + RB.t.scale + "</span>" +
          '<div class="yield__readout">' +
            '<button type="button" class="stepper" data-step="-1" aria-label="' + RB.t.fewer + '">−</button>' +
            '<span class="yield__num" id="yieldNum" role="status" aria-live="polite">' + servings + "</span>" +
            '<span class="yield__unit" id="yieldUnit">' +
              RB.esc(RB.servingsUnit(R, servings)) + "</span>" +
            '<button type="button" class="stepper" data-step="1" aria-label="' + RB.t.more + '">+</button>' +
          "</div>" +
        "</div>"
      : "";

    var rows = R.ingredients.map(function (ing, i) {
      if (ing.heading) {
        return '<li class="ing__heading">' + RB.esc(ing.heading) + "</li>";
      }
      return '<li class="ing__item" data-i="' + i + '" role="checkbox" tabindex="0" aria-checked="false">' +
        '<span class="ing__qty" data-qty="' + (ing.qty != null ? ing.qty : "") + '" ' +
          'data-unit="' + RB.esc(ing.unit || "") + '"></span>' +
        '<span class="ing__name">' + RB.esc(ing.name || "") +
          (ing.note ? '<span class="ing__note">, ' + RB.esc(ing.note) + "</span>" : "") +
        "</span></li>";
    }).join("");

    box.innerHTML = '<h2 class="h2">' + RB.t.ingredients + "</h2>" + yieldHTML +
      '<ul class="ing">' + rows + "</ul>";

    paintQuantities(false);

    if (scalable) {
      box.addEventListener("click", function (e) {
        var btn = e.target.closest(".stepper");
        if (!btn) return;
        var next = servings + Number(btn.dataset.step);
        if (next < 1 || next > 99) return;
        servings = next;
        document.getElementById("yieldNum").textContent = servings;
        document.getElementById("yieldUnit").textContent = RB.servingsUnit(R, servings);
        flash(document.getElementById("yieldNum"));
        paintQuantities(true);
        paintNutrition(true);
      });
    }

    // Tap or press Enter/Space to tick an ingredient off.
    var doneKey = "done:ing:" + R.slug;
    var done = RB.store.get(doneKey, []);

    function setDone(li, on) {
      li.classList.toggle("is-done", on);
      li.setAttribute("aria-checked", String(on));
    }

    box.querySelectorAll(".ing__item").forEach(function (li) {
      if (done.indexOf(li.dataset.i) !== -1) setDone(li, true);
      function toggle() {
        var on = !li.classList.contains("is-done");
        setDone(li, on);
        var idx = done.indexOf(li.dataset.i);
        if (on && idx === -1) done.push(li.dataset.i);
        if (!on && idx !== -1) done.splice(idx, 1);
        RB.store.set(doneKey, done);
      }
      li.addEventListener("click", toggle);
      li.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
      });
    });
  }

  /* Recompute every quantity for the current yield. */
  function paintQuantities(animate) {
    var ratio = R.servings ? servings / R.servings : 1;
    document.querySelectorAll(".ing__qty").forEach(function (el) {
      var raw = el.dataset.qty;
      if (raw === "") { el.textContent = ""; return; }
      var value = RB.formatQty(Number(raw) * ratio);
      var unit = el.dataset.unit;
      var next = value + (unit ? " " + unit : "");
      if (el.textContent !== next) {
        el.textContent = next;
        if (animate) flash(el);
      }
    });
  }

  function flash(el) {
    if (RB.reducedMotion) return;
    el.classList.remove("is-ticking");
    void el.offsetWidth;                     // restart the transition
    el.classList.add("is-ticking");
    setTimeout(function () { el.classList.remove("is-ticking"); }, 320);
  }

  /* --- nutrition (optional) ----------------------------------------------- */

  function renderNutrition() {
    var box = document.getElementById("nutrition");
    var n = R.nutrition;

    // Absent, empty, or all-blank: the whole section never reaches the page.
    var keys = n ? Object.keys(RB.t.nutriLabels).filter(function (k) {
      return n[k] !== undefined && n[k] !== null && n[k] !== "";
    }) : [];
    if (!keys.length) { box.remove(); return; }

    box.innerHTML = '<h2 class="h2">' + RB.t.nutrition + "</h2>" +
      '<p class="nutri__scope tag-label" id="nutriScope"></p>' +
      '<dl class="nutri">' + keys.map(function (k) {
        return '<div class="nutri__row"><dt>' + RB.esc(RB.t.nutriLabels[k]) + "</dt>" +
          '<dd class="nutri__val" data-base="' + RB.esc(String(n[k])) +
          '" data-unit="' + RB.esc(RB.t.nutriUnits[k] || "") + '"></dd></div>';
      }).join("") + "</dl>";

    paintNutrition(false);
  }

  /* The macros follow the portion stepper. Recipe files hold the figures for
     one serving; the page shows the total for however many are set above. A
     recipe without a servings count can't scale, so it keeps its own label. */
  function paintNutrition(animate) {
    var scope = document.getElementById("nutriScope");
    if (!scope) return;

    var n = R.nutrition || {};
    var scalable = R.servings > 0;

    scope.textContent = scalable
      ? RB.t.nutriFor + " " + servings + " " + RB.servingsUnit(R, servings)
      : (n.per || RB.t.perServing);

    document.querySelectorAll(".nutri__val").forEach(function (el) {
      var base = Number(el.dataset.base);
      var unit = el.dataset.unit;
      // Anything that isn't a plain number ("ca. 300") can only be shown as is.
      var next = isFinite(base)
        ? RB.formatNum(base * (scalable ? servings : 1)) + (unit ? " " + unit : "")
        : el.dataset.base;
      if (el.textContent !== next) {
        el.textContent = next;
        if (animate) flash(el);
      }
    });
  }

  /* --- steps -------------------------------------------------------------- */

  function renderSteps() {
    var box = document.getElementById("steps");
    if (!R.steps.length) { box.remove(); return; }

    box.innerHTML = '<h2 class="h2">' + RB.t.method + "</h2>" +
      '<div class="progress"><div class="progress__track">' +
        '<div class="progress__bar" id="stepBar"></div></div>' +
        '<span class="progress__text" id="stepText"></span></div>' +
      '<ol class="steps">' + R.steps.map(function (s, i) {
        return '<li class="step" data-i="' + i + '" role="checkbox" tabindex="0" aria-checked="false">' +
          '<span class="step__num" aria-hidden="true"></span>' +
          (s.title ? '<h3 class="step__title">' + RB.esc(s.title) + "</h3>" : "") +
          '<p class="step__body">' + RB.esc(s.body || "") + "</p>" +
        "</li>";
      }).join("") + "</ol>";

    var doneKey = "done:steps:" + R.slug;
    var done = RB.store.get(doneKey, []);
    var items = box.querySelectorAll(".step");

    function updateProgress() {
      var n = box.querySelectorAll(".step.is-done").length;
      var pct = items.length ? Math.round((n / items.length) * 100) : 0;
      document.getElementById("stepBar").style.width = pct + "%";
      document.getElementById("stepText").textContent = n + " / " + items.length;
    }

    items.forEach(function (li) {
      if (done.indexOf(li.dataset.i) !== -1) {
        li.classList.add("is-done");
        li.setAttribute("aria-checked", "true");
      }
      function toggle() {
        var on = !li.classList.contains("is-done");
        li.classList.toggle("is-done", on);
        li.setAttribute("aria-checked", String(on));
        var idx = done.indexOf(li.dataset.i);
        if (on && idx === -1) done.push(li.dataset.i);
        if (!on && idx !== -1) done.splice(idx, 1);
        RB.store.set(doneKey, done);
        updateProgress();
      }
      li.addEventListener("click", toggle);
      li.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
      });
    });

    updateProgress();
  }

  /* --- intro, notes, source ----------------------------------------------- */

  function renderProse() {
    var intro = document.getElementById("intro");
    if (R.intro) {
      intro.textContent = R.intro;
      // A drop cap needs at least the two lines it spans to sit beside it,
      // otherwise it hangs past the end of the paragraph.
      if (R.intro.length > 190) intro.classList.add("has-dropcap");
    } else {
      intro.remove();
    }

    var notes = document.getElementById("notes");
    if (R.notes.length) {
      notes.innerHTML = '<h2 class="h2">' + RB.t.notes + '</h2><ul class="notes">' +
        R.notes.map(function (n) { return "<li>" + RB.esc(n) + "</li>"; }).join("") + "</ul>";
    } else { notes.remove(); }

    var src = document.getElementById("source");
    if (R.source) {
      src.innerHTML = RB.t.source + ": " + (R.sourceUrl
        ? '<a href="' + RB.esc(R.sourceUrl) + '" rel="noopener">' + RB.esc(R.source) + "</a>"
        : RB.esc(R.source));
    } else { src.remove(); }
  }

  /* --- lightbox ------------------------------------------------------------
     Opened from the expand button on the header, starting at whichever image
     the carousel is showing.
     -------------------------------------------------------------------- */

  var lb, lbImg, lbIndex = 0;

  function openLightbox(i) {
    if (!lb) {
      lb = document.createElement("div");
      lb.className = "lightbox";
      lb.innerHTML =
        '<button class="lightbox__close" aria-label="' + RB.t.imageClose + '">✕</button>' +
        '<button class="lightbox__nav lightbox__nav--prev" aria-label="' +
          RB.t.imagePrev + '">‹</button>' +
        '<img alt="">' +
        '<button class="lightbox__nav lightbox__nav--next" aria-label="' +
          RB.t.imageNext + '">›</button>';
      document.body.appendChild(lb);
      lbImg = lb.querySelector("img");

      lb.addEventListener("click", function (e) {
        if (e.target === lb || e.target.closest(".lightbox__close")) return closeLightbox();
        if (e.target.closest(".lightbox__nav--prev")) return step(-1);
        if (e.target.closest(".lightbox__nav--next")) return step(1);
      });
      document.addEventListener("keydown", function (e) {
        if (!lb.classList.contains("is-open")) return;
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowLeft") step(-1);
        if (e.key === "ArrowRight") step(1);
      });
    }
    lbIndex = i;
    lbImg.src = R.images[i];
    lb.classList.add("is-open");
    document.body.style.overflow = "hidden";
    stopAuto();
  }

  function step(d) {
    lbIndex = (lbIndex + d + R.images.length) % R.images.length;
    lbImg.src = R.images[lbIndex];
  }

  function closeLightbox() {
    lb.classList.remove("is-open");
    document.body.style.overflow = "";
    // Leave the header on whatever was last looked at, then carry on.
    goSlide(lbIndex, true);
  }

  /* --- cook mode ---------------------------------------------------------- */

  var wakeLock = null;

  function wireCookMode() {
    var btn = document.getElementById("cookBtn");
    if (!btn) return;

    btn.addEventListener("click", async function () {
      var on = document.body.classList.toggle("cook-mode");
      btn.setAttribute("aria-pressed", String(on));
      btn.querySelector("span").textContent = on ? RB.t.cookOn : RB.t.cookOff;

      if (on) {
        try {
          if ("wakeLock" in navigator) {
            wakeLock = await navigator.wakeLock.request("screen");
            RB.toast(RB.t.cookWake);
          } else {
            RB.toast(RB.t.cookPlain);
          }
        } catch (e) {
          RB.toast(RB.t.cookPlain);
        }
        window.scrollTo({ top: 0, behavior: RB.reducedMotion ? "auto" : "smooth" });
      } else if (wakeLock) {
        wakeLock.release().catch(function () {});
        wakeLock = null;
      }
    });

    // Browsers drop the wake lock when the tab is hidden; take it back.
    document.addEventListener("visibilitychange", async function () {
      if (document.visibilityState === "visible" &&
          document.body.classList.contains("cook-mode") &&
          "wakeLock" in navigator && !wakeLock) {
        try { wakeLock = await navigator.wakeLock.request("screen"); } catch (e) {}
      }
    });
  }

  /* --- pager + reading bar ------------------------------------------------ */

  function renderPager(list) {
    var i = list.findIndex(function (r) { return r.slug === R.slug; });
    var prev = list[i - 1];
    var next = list[i + 1];
    var pager = document.getElementById("pager");
    if (!prev && !next) { pager.remove(); return; }

    pager.innerHTML =
      (prev ? '<a href="recipe.html?r=' + encodeURIComponent(prev.slug) + '">' +
        '<span class="pager__k tag-label">' + RB.t.prev + "</span>" +
        '<span class="pager__t">' + RB.esc(prev.title) + "</span></a>" : "") +
      (next ? '<a href="recipe.html?r=' + encodeURIComponent(next.slug) + '">' +
        '<span class="pager__k tag-label">' + RB.t.next + "</span>" +
        '<span class="pager__t">' + RB.esc(next.title) + "</span></a>" : "");
  }

  function readingBar() {
    var bar = document.createElement("div");
    bar.className = "readbar";
    document.body.appendChild(bar);
    var ticking = false;
    function frame() {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? Math.min(100, (window.scrollY / h) * 100) : 0) + "%";
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(frame); }
    }, { passive: true });
    frame();
  }

  /* --- not found ---------------------------------------------------------- */

  function notFound(slug) {
    document.getElementById("rail").remove();
    document.getElementById("pager").remove();
    document.getElementById("hero").className = "rhero rhero--flat";
    document.getElementById("hero").innerHTML =
      '<div class="rhero__inner">' +
        '<span class="rhero__eyebrow tag-label">' + RB.t.notFoundEyebrow + "</span>" +
        '<h1 class="rhero__title">' + RB.t.notFoundTitle + "</h1>" +
        '<p class="rhero__sub">' +
          (slug ? RB.t.notFoundLead.replace("%s", RB.esc(slug)) : "") +
          RB.t.notFoundHint +
        "</p>" +
      "</div>";
    var body = document.querySelector(".rbody");
    body.style.display = "block";
    body.innerHTML = '<p><a href="index.html">' + RB.t.backToAll + "</a></p>";
  }

  /* --- boot --------------------------------------------------------------- */

  document.addEventListener("DOMContentLoaded", function () {
    RB.paintChrome();

    RB.loadRecipes().then(function (list) {
      var slug = qs("r");
      R = list.filter(function (x) { return x.slug === slug; })[0];

      if (!R) { document.title = RB.t.notFoundTitle + " — " + (RB.cfg.title || ""); return notFound(slug); }

      document.title = R.title + " — " + (RB.cfg.title || "");

      renderHero();
      renderRail();
      renderProse();
      renderIngredients();
      renderNutrition();
      renderSteps();
      renderPager(list);
      wireCookMode();
      RB.wireStars(document);
      readingBar();
    });
  });
})();
