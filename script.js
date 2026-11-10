function escapeHtml(str){
  return String(str == null ? '' : str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function escapeAttr(str){
  return escapeHtml(str).replace(/"/g,'&quot;');
}

function toggleMateria(card){
  document.querySelectorAll('.materia.aberta').forEach(function(c){
    if(c !== card) c.classList.remove('aberta');
  });
  card.classList.toggle('aberta');
}

function abrirMateria(card){
  var url = card.dataset.link;
  if(url) window.open(url, '_blank', 'noopener');
}

function toggleVerTodas(btn){
  var secaoEl = btn.closest('.secao');
  var extras = secaoEl.querySelectorAll('.materia.extra');
  var estaMostrandoTudo = btn.dataset.aberto === '1';
  extras.forEach(function(c){ c.classList.toggle('oculta', estaMostrandoTudo); });
  btn.dataset.aberto = estaMostrandoTudo ? '0' : '1';
  btn.textContent = estaMostrandoTudo ? btn.dataset.verTexto : 'Ver menos';
  if(window.ScrollTrigger){
    requestAnimationFrame(function(){ ScrollTrigger.refresh(); });
  }
}

function renderHeader(){
  document.getElementById('logo').innerHTML =
    escapeHtml(content.logoPrimeiroNome) + ' <span>' + escapeHtml(content.logoSobrenome) + '</span>';

  document.getElementById('nav-lista').innerHTML = content.nav
    .map(function(item){ return '<li><a href="' + escapeAttr(item.href) + '">' + escapeHtml(item.texto) + '</a></li>'; })
    .join('');
}

function toggleHeroTexto(btn){
  var extra = document.querySelector('.hero-extra');
  if(!extra) return;
  var aberto = btn.dataset.aberto === '1';
  extra.classList.toggle('oculta', aberto);
  btn.dataset.aberto = aberto ? '0' : '1';
  btn.textContent = aberto ? 'Ver mais' : 'Ver menos';
}

function renderHero(){
  var h = content.hero;
  document.getElementById('hero-kicker').textContent = h.kicker;
  document.getElementById('hero-titulo').textContent = h.titulo;

  var paragrafos = h.paragrafos || [];
  var primeiro = paragrafos.length ? '<p>' + escapeHtml(paragrafos[0]) + '</p>' : '';
  var resto = paragrafos.slice(1).map(function(p){ return '<p>' + escapeHtml(p) + '</p>'; }).join('');
  document.getElementById('hero-paragrafos').innerHTML =
    primeiro + (resto ? '<div class="hero-extra oculta">' + resto + '</div>' : '');

  var botaoVerMais = document.getElementById('hero-ver-mais');
  if(resto){
    botaoVerMais.style.display = '';
    botaoVerMais.textContent = 'Ver mais';
    botaoVerMais.dataset.aberto = '0';
  } else {
    botaoVerMais.style.display = 'none';
  }

  var botao = document.getElementById('hero-botao');
  botao.textContent = h.botaoTexto;
  botao.href = h.botaoHref;

  var foto = document.getElementById('hero-foto');
  foto.src = h.fotoUrl;
  foto.alt = h.fotoAlt;
}

var SECAO_REVISTA_ID = 'nova-secao-1785446582110';

function materiaCardHTML(item, toggleTexto, linkTexto, oculta, ehRevista){
  var ehPdf = /\.pdf(\?|#|$)/i.test(item.link || '');
  var videos = item.videos || [];
  var midia;
  if(videos.length){
    midia = '<div class="materia-videos" onclick="event.stopPropagation()">' +
      videos.map(function(video){
        var url = (typeof video === 'string') ? video : (video.url || '');
        var poster = (typeof video === 'string') ? '' : (video.poster || '');
        var posterAttr = poster ? ' poster="' + escapeAttr(poster) + '"' : '';
        return '<video class="materia-video-item" src="' + escapeAttr(url) + '"' + posterAttr + ' controls preload="metadata"></video>';
      }).join('') +
    '</div>';
  } else {
    midia = item.capaUrl ? '<img class="materia-capa" src="' + escapeAttr(item.capaUrl) + '" alt="' + escapeAttr(item.capaAlt) + '">' : '';
  }

  var corpoExtra, atributoLink;
  if(ehRevista){
    var paragrafos = item.textoCompleto.map(function(p){ return '<p>' + escapeHtml(p) + '</p>'; }).join('');
    var linkFinal = ehPdf ? 'Abrir PDF da edição ↗' : escapeHtml(linkTexto);
    corpoExtra =
      '<div class="materia-toggle">' + escapeHtml(toggleTexto) + ' <span class="seta">▾</span></div>' +
      '<div class="materia-completa">' +
        paragrafos +
        '<a href="' + escapeAttr(item.link) + '" target="_blank" onclick="event.stopPropagation()">' + linkFinal + '</a>' +
      '</div>';
    atributoLink = '';
  } else {
    // matérias: sem texto completo embutido, o card inteiro abre a publicação original
    corpoExtra = '<div class="materia-toggle">' + (ehPdf ? 'Abrir PDF ↗' : escapeHtml(linkTexto)) + '</div>';
    atributoLink = ' data-link="' + escapeAttr(item.link) + '"';
  }

  return (
    '<div class="materia' + (oculta ? ' extra oculta' : '') + '"' + atributoLink +
      ' onclick="' + (ehRevista ? 'toggleMateria(this)' : 'abrirMateria(this)') + '">' +
      midia +
      '<div class="materia-corpo">' +
        '<span class="materia-tag">' + escapeHtml(item.tag) + '</span>' +
        '<h3>' + escapeHtml(item.titulo) + '</h3>' +
        '<p class="materia-resumo">' + escapeHtml(item.resumo) + '</p>' +
        corpoExtra +
      '</div>' +
    '</div>'
  );
}

function secaoHTML(secao){
  var visiveis = secao.visiveis || 4;
  var ehRevista = secao.id === SECAO_REVISTA_ID;
  var cards = secao.itens.map(function(item, i){
    return materiaCardHTML(item, secao.toggleTexto, secao.linkTexto, i >= visiveis, ehRevista);
  }).join('');

  var temMais = secao.itens.length > visiveis;
  var estilo = '';
  if(secao.fundo === 'imagem' && secao.fundoImagemUrl){
    estilo = ' style="background-image:url(&quot;' + escapeAttr(secao.fundoImagemUrl) + '&quot;)"';
  }

  var descricaoParagrafos = (secao.descricao || []).map(function(p){ return '<p>' + escapeHtml(p) + '</p>'; }).join('');
  var descricaoHtml = descricaoParagrafos ? '<div class="secao-descricao">' + descricaoParagrafos + '</div>' : '';

  return (
    '<section class="secao pin-stage" id="' + escapeAttr(secao.id) + '" data-fundo="' + escapeAttr(secao.fundo) + '"' + estilo + '>' +
      '<div class="container">' +
        '<div class="secao-titulo"><h2>' + escapeHtml(secao.titulo) + '</h2></div>' +
        descricaoHtml +
        '<div class="grid-materias">' + cards + '</div>' +
        (temMais ?
          '<button type="button" class="btn-ver-todas" data-ver-texto="' + escapeAttr(secao.verTodasTexto) + '" onclick="toggleVerTodas(this)">' +
            escapeHtml(secao.verTodasTexto) +
          '</button>'
          : '') +
      '</div>' +
    '</section>'
  );
}

function renderSecoes(){
  document.getElementById('secoes-dinamicas').innerHTML = content.secoes.map(secaoHTML).join('');
}

function renderCurriculo(){
  document.getElementById('titulo-curriculo').textContent = content.curriculo.tituloSecao;
  document.getElementById('lista-timeline').innerHTML = content.curriculo.itens.map(function(item){
    return (
      '<div class="timeline-item">' +
        '<div class="timeline-data">' + escapeHtml(item.data) + '</div>' +
        '<h3>' + escapeHtml(item.titulo) + '</h3>' +
        '<p>' + escapeHtml(item.descricao) + '</p>' +
      '</div>'
    );
  }).join('');

  document.getElementById('titulo-certificados').textContent = content.certificados.tituloSecao;
  document.getElementById('lista-certificados').innerHTML = content.certificados.itens.map(function(item){
    var titulo = item.link
      ? '<h4><a href="' + escapeAttr(item.link) + '" target="_blank" rel="noopener">' + escapeHtml(item.titulo) + ' ↗</a></h4>'
      : '<h4>' + escapeHtml(item.titulo) + '</h4>';
    return (
      '<div class="certificado-item">' +
        titulo +
        '<div class="certificado-instituicao">' + escapeHtml(item.instituicao) + '</div>' +
        '<div class="certificado-ano">' + escapeHtml(item.ano) + '</div>' +
      '</div>'
    );
  }).join('');
}

function renderContato(){
  var c = content.contato;
  document.getElementById('titulo-contato').textContent = c.tituloSecao;
  document.getElementById('contato-texto').textContent = c.texto;

  var email = document.getElementById('contato-email');
  email.textContent = c.email;
  email.href = 'mailto:' + c.email;

  document.getElementById('contato-redes-texto').textContent = c.redesTexto;
  document.getElementById('contato-redes').innerHTML = c.redes.map(function(r){
    return '<a href="' + escapeAttr(r.url) + '" target="_blank">' + escapeHtml(r.nome) + '</a>';
  }).join('');
}

function renderFooter(){
  document.getElementById('footer-texto').textContent = content.footer;
}

function iniciarEfeitos(){
  var reduzido = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // contador de seções (header não entra na contagem)
  var secoesPagina = Array.prototype.slice.call(document.querySelectorAll('#sobre, .secao'));
  var totalEl = document.getElementById('contador-total');
  if(totalEl) totalEl.textContent = String(secoesPagina.length).padStart(2, '0');

  var temLibs = !!(window.gsap && window.ScrollTrigger);
  if(!temLibs) return;
  gsap.registerPlugin(ScrollTrigger);

  if(window.Lenis && !reduzido){
    var lenis = new Lenis({ smoothWheel:true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function(time){ lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  // barra de progresso de leitura
  var barraFill = document.getElementById('progresso-fill');
  if(barraFill){
    ScrollTrigger.create({ start:0, end:'max', onUpdate:function(self){
      barraFill.style.transform = 'scaleX(' + self.progress + ')';
    }});
  }

  // contador: marca em qual seção o visitante está
  var contadorN = document.getElementById('contador-n');
  secoesPagina.forEach(function(sec, i){
    ScrollTrigger.create({ trigger:sec, start:'top center', end:'bottom center', onToggle:function(self){
      if(self.isActive && contadorN) contadorN.textContent = String(i + 1).padStart(2, '0');
    }});
  });

  // header: transparente sobre a foto do hero, sólido depois de passar dela
  var heroEl = document.getElementById('sobre');
  if(heroEl){
    ScrollTrigger.create({
      trigger: heroEl, start:'bottom top',
      onEnter:function(){ document.body.classList.add('scrolled'); },
      onLeaveBack:function(){ document.body.classList.remove('scrolled'); }
    });
  }

  if(reduzido) return;

  // abertura: cabeçalho e hero entram em cascata
  gsap.timeline()
    .from('.hero-media img', {scale:1.12, duration:1.1, ease:'power2.out'})
    .from('header', {y:-26, opacity:0, duration:.6, ease:'power3.out'}, '-=.9')
    .from('#hero-kicker, #hero-titulo, #hero-paragrafos, .hero-ver-mais, #hero-botao', {y:16, opacity:0, duration:.6, stagger:.08, ease:'power3.out'}, '-=.6')
    .from('.scroll-cue', {opacity:0, duration:.6}, '-=.2');

  // revela cada seção ao rolar até ela
  document.querySelectorAll('.secao').forEach(function(sec){
    gsap.from(sec.querySelector('.secao-titulo'), {
      y:24, opacity:0, duration:.7, ease:'power2.out',
      scrollTrigger:{trigger:sec, start:'top 80%'}
    });
  });

  // cards: tilt 3D seguindo o mouse
  document.querySelectorAll('.materia').forEach(function(card){
    var qx = gsap.quickTo(card, 'rotateX', {duration:.4, ease:'power2.out'});
    var qy = gsap.quickTo(card, 'rotateY', {duration:.4, ease:'power2.out'});
    card.style.transformPerspective = 600;
    card.addEventListener('mousemove', function(e){
      var r = card.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - .5;
      var py = (e.clientY - r.top) / r.height - .5;
      qx(-py * 8); qy(px * 8);
    });
    card.addEventListener('mouseleave', function(){ qx(0); qy(0); });
  });

  // menu e botão principal: efeito magnético
  document.querySelectorAll('nav a, .btn').forEach(function(el){
    var qx = gsap.quickTo(el, 'x', {duration:.3, ease:'power3.out'});
    var qy = gsap.quickTo(el, 'y', {duration:.3, ease:'power3.out'});
    el.addEventListener('mousemove', function(e){
      var r = el.getBoundingClientRect();
      qx((e.clientX - r.left - r.width / 2) * .3);
      qy((e.clientY - r.top - r.height / 2) * .3);
    });
    el.addEventListener('mouseleave', function(){ qx(0); qy(0); });
  });

  // cada seção pina e rola os cards na horizontal enquanto a página desce;
  // a distância de scroll fica limitada pra não ficar enorme quando tem muitos cards
  document.querySelectorAll('.pin-stage').forEach(function(stage){
    var track = stage.querySelector('.grid-materias');
    if(!track || !track.children.length) return;
    ScrollTrigger.addEventListener('refreshInit', function(){ track.classList.add('js-pinned'); });
    gsap.to(track, {
      x: function(){ return -(track.scrollWidth - track.clientWidth) - 20; },
      ease:'none',
      scrollTrigger:{
        trigger: stage, start:'top top',
        end: function(){ return '+=' + Math.min(track.scrollWidth - track.clientWidth + 200, window.innerHeight * 1.4); },
        scrub:true, pin:true, anticipatePin:1, invalidateOnRefresh:true
      }
    });
  });

  ScrollTrigger.refresh();
}

document.addEventListener('DOMContentLoaded', function(){
  renderHeader();
  renderHero();
  renderSecoes();
  renderCurriculo();
  renderContato();
  renderFooter();

  document.querySelectorAll('.materia-completa').forEach(function(el){
    el.addEventListener('click', function(e){ e.stopPropagation(); });
  });

  iniciarEfeitos();
});
