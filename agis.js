(function(){
  var d = document, h = d.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s, c){ return (c || d).querySelector(s); }
  function $$(s, c){ return Array.prototype.slice.call((c || d).querySelectorAll(s)); }
  function cl(v){ return v < 0 ? 0 : v > 1 ? 1 : v; }

  /* Tema claro / oscuro */
  var tb = $('#themeBtn');
  function eff(){ var t = h.getAttribute('data-theme'); if (t) return t; return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }
  function sync(){ if (!tb) return; var dk = eff() === 'dark'; tb.classList.toggle('is-dark', dk); tb.setAttribute('aria-label', dk ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'); }
  if (tb) tb.addEventListener('click', function(){ var n = eff() === 'dark' ? 'light' : 'dark'; h.setAttribute('data-theme', n); try { localStorage.setItem('agis-tema', n); } catch (e) {} sync(); });
  sync();

  /* Menú del celular */
  var mb = $('#menuBtn'), mp = $('#menuPanel');
  if (mb && mp) {
    mb.addEventListener('click', function(){ var open = mp.hidden; mp.hidden = !open; mb.setAttribute('aria-expanded', String(open)); });
    d.addEventListener('keydown', function(e){ if (e.key === 'Escape' && !mp.hidden) { mp.hidden = true; mb.setAttribute('aria-expanded', 'false'); mb.focus(); } });
  }

  /* Cabecera con línea al bajar */
  var hd = $('.hd');
  function hs(){ if (hd) hd.classList.toggle('sc', scrollY > 8); }
  addEventListener('scroll', hs, { passive: true }); hs();

  /* Palabra que rota en la portada */
  var rw = $('#rotWord');
  if (rw && !reduce) {
    var W = rw.getAttribute('data-words').split('|'), wi = 0;
    setInterval(function(){
      rw.classList.add('out');
      setTimeout(function(){ wi = (wi + 1) % W.length; rw.textContent = W[wi]; rw.classList.remove('out'); }, 320);
    }, 2600);
  }

  /* Aparición suave */
  var rv = $$('.rv');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    rv.forEach(function(el){ io.observe(el); });
  } else rv.forEach(function(el){ el.classList.add('in'); });

  /* Carrusel de servicios */
  $$('[data-hs]').forEach(function(w){
    var sc = $('.hs', w), pv = $('.hs-prev', w), nx = $('.hs-next', w); if (!sc) return;
    function step(dir){ var c = sc.firstElementChild, s = c ? c.getBoundingClientRect().width + 16 : 300; sc.scrollBy({ left: dir * s, behavior: reduce ? 'auto' : 'smooth' }); }
    function upd(){ if (pv) pv.disabled = sc.scrollLeft < 4; if (nx) nx.disabled = sc.scrollLeft + sc.clientWidth >= sc.scrollWidth - 4; }
    if (pv) pv.addEventListener('click', function(){ step(-1); });
    if (nx) nx.addEventListener('click', function(){ step(1); });
    sc.addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
  });

  /* Visor de capas: las capas caen una por una mientras bajas */
  var st = $('#cpStack');
  if (st) {
    var stage = $('#cpStage'), L = $$('.cp-l', st), B = $$('.cp-beam', st), items = $$('#cpList li'), cnt = $('#cpN'), rd = $('#cpRead');
    var big = matchMedia('(min-width: 901px)');
    function ease(x){ return 1 - Math.pow(1 - x, 3); }
    function draw(){
      var p = 1;
      if (!reduce) { var r = stage.getBoundingClientRect(), vh = innerHeight; p = cl((vh * .92 - r.top) / (vh * .72)); }
      var t = p * 5.2, g0 = big.matches ? 26 : 20, g1 = big.matches ? 58 : 40, k = 1;
      st.style.setProperty('--gap', (g0 + (g1 - g0) * p).toFixed(1) + 'px');
      st.style.setProperty('--rz', (-24 - 16 * p).toFixed(2) + 'deg');
      L.forEach(function(l, i){
        if (!i) return;
        var a = cl((t - (i - 1 + .1)) / .85);
        l.style.setProperty('--lift', ((1 - ease(a)) * 170).toFixed(1) + 'px');
        l.style.opacity = a.toFixed(3);
        if (a > .6) k++;
      });
      B.forEach(function(b, j){ b.style.setProperty('--b', cl((t - 4.1 - j * .15) / .8).toFixed(3)); });
      items.forEach(function(li, i){ li.classList.toggle('on', items.length - 1 - i < k); });
      if (cnt) cnt.textContent = k;
      if (rd) rd.classList.toggle('on', t > 4.4);
    }
    var q = 0;
    function req(){ if (!q) q = requestAnimationFrame(function(){ q = 0; draw(); }); }
    addEventListener('scroll', req, { passive: true }); addEventListener('resize', req); draw();
    var sc2 = $('#cpScene');
    if (sc2 && !reduce && matchMedia('(hover: hover)').matches) {
      stage.addEventListener('pointermove', function(e){ var r = stage.getBoundingClientRect(); sc2.style.setProperty('--tx', (((e.clientX - r.left) / r.width - .5) * 10).toFixed(2) + 'deg'); sc2.style.setProperty('--ty', (-((e.clientY - r.top) / r.height - .5) * 8).toFixed(2) + 'deg'); });
      stage.addEventListener('pointerleave', function(){ sc2.style.setProperty('--tx', '0deg'); sc2.style.setProperty('--ty', '0deg'); });
    }
  }

  /* Formulario corto de la portada: lleva el dato al formulario de contacto */
  var qf = $('#quickForm');
  if (qf) qf.addEventListener('submit', function(e){
    e.preventDefault();
    var v = $('input', qf).value.trim();
    try { sessionStorage.setItem('agis-obra', v); } catch (er) {}
    location.href = 'contacto.html#formulario';
  });
  var mu = $('#f-mun');
  if (mu) { try { var sv = sessionStorage.getItem('agis-obra'); if (sv && !mu.value) mu.value = sv; sessionStorage.removeItem('agis-obra'); } catch (er) {} }

  /* Formulario de contacto (página de muestra: no envía nada) */
  $$('form[data-demo]').forEach(function(f){
    f.addEventListener('submit', function(e){
      e.preventDefault();
      if (!f.checkValidity()) { f.reportValidity(); return; }
      var m = $('.form-msg', f); if (m) { m.hidden = false; m.focus(); }
    });
  });
})();
