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

function toggleVerTodas(btn){
  var secaoEl = btn.closest('.secao');
  var extras = secaoEl.querySelectorAll('.materia.extra');
  var estaMostrandoTudo = btn.dataset.aberto === '1';
  extras.forEach(function(c){ c.classList.toggle('oculta', estaMostrandoTudo); });
  btn.dataset.aberto = estaMostrandoTudo ? '0' : '1';
  btn.textContent = estaMostrandoTudo ? btn.dataset.verTexto : 'Ver menos';
}

function renderHeader(){
  document.getElementById('logo').innerHTML =
    escapeHtml(content.logoPrimeiroNome) + ' <span>' + escapeHtml(content.logoSobrenome) + '</span>';

  document.getElementById('nav-lista').innerHTML = content.nav
    .map(function(item){ return '<li><a href="' + escapeAttr(item.href) + '">' + escapeHtml(item.texto) + '</a></li>'; })
    .join('');
}

function renderHero(){
  var h = content.hero;
  document.getElementById('hero-kicker').textContent = h.kicker;
  document.getElementById('hero-titulo').textContent = h.titulo;
  document.getElementById('hero-paragrafos').innerHTML =
    h.paragrafos.map(function(p){ return '<p>' + escapeHtml(p) + '</p>'; }).join('');

  var botao = document.getElementById('hero-botao');
  botao.textContent = h.botaoTexto;
  botao.href = h.botaoHref;

  var foto = document.getElementById('hero-foto');
  foto.src = h.fotoUrl;
  foto.alt = h.fotoAlt;
}

function materiaCardHTML(item, toggleTexto, linkTexto, oculta){
  var paragrafos = item.textoCompleto.map(function(p){ return '<p>' + escapeHtml(p) + '</p>'; }).join('');
  return (
    '<div class="materia' + (oculta ? ' extra oculta' : '') + '" onclick="toggleMateria(this)">' +
      '<img class="materia-capa" src="' + escapeAttr(item.capaUrl) + '" alt="' + escapeAttr(item.capaAlt) + '">' +
      '<div class="materia-corpo">' +
        '<span class="materia-tag">' + escapeHtml(item.tag) + '</span>' +
        '<h3>' + escapeHtml(item.titulo) + '</h3>' +
        '<p class="materia-resumo">' + escapeHtml(item.resumo) + '</p>' +
        '<div class="materia-toggle">' + escapeHtml(toggleTexto) + ' <span class="seta">▾</span></div>' +
        '<div class="materia-completa">' +
          paragrafos +
          '<a href="' + escapeAttr(item.link) + '" target="_blank" onclick="event.stopPropagation()">' + escapeHtml(linkTexto) + '</a>' +
        '</div>' +
      '</div>' +
    '</div>'
  );
}

function secaoHTML(secao){
  var visiveis = secao.visiveis || 4;
  var cards = secao.itens.map(function(item, i){
    return materiaCardHTML(item, secao.toggleTexto, secao.linkTexto, i >= visiveis);
  }).join('');

  var temMais = secao.itens.length > visiveis;
  var estilo = '';
  if(secao.fundo === 'imagem' && secao.fundoImagemUrl){
    estilo = ' style="background-image:url(&quot;' + escapeAttr(secao.fundoImagemUrl) + '&quot;)"';
  }

  return (
    '<section class="secao" id="' + escapeAttr(secao.id) + '" data-fundo="' + escapeAttr(secao.fundo) + '"' + estilo + '>' +
      '<div class="container">' +
        '<div class="secao-titulo"><h2>' + escapeHtml(secao.titulo) + '</h2></div>' +
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
}

function renderBlog(){
  document.getElementById('titulo-blog').textContent = content.blog.tituloSecao;
  document.getElementById('lista-blog').innerHTML = content.blog.itens.map(function(item){
    return (
      '<div class="blog-item">' +
        '<div class="blog-data">' + escapeHtml(item.data) + '</div>' +
        '<div>' +
          '<h3>' + escapeHtml(item.titulo) + '</h3>' +
          '<p>' + escapeHtml(item.resumo) + '</p>' +
        '</div>' +
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

document.addEventListener('DOMContentLoaded', function(){
  renderHeader();
  renderHero();
  renderSecoes();
  renderCurriculo();
  renderBlog();
  renderContato();
  renderFooter();

  document.querySelectorAll('.materia-completa').forEach(function(el){
    el.addEventListener('click', function(e){ e.stopPropagation(); });
  });
});
