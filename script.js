function toggleMateria(card){
  document.querySelectorAll('.materia.aberta').forEach(function(c){
    if(c !== card) c.classList.remove('aberta');
  });
  card.classList.toggle('aberta');
}

function renderHeader(){
  document.getElementById('logo').innerHTML =
    content.logoPrimeiroNome + ' <span>' + content.logoSobrenome + '</span>';

  document.getElementById('nav-lista').innerHTML = content.nav
    .map(function(item){ return '<li><a href="' + item.href + '">' + item.texto + '</a></li>'; })
    .join('');
}

function renderHero(){
  var h = content.hero;
  document.getElementById('hero-kicker').textContent = h.kicker;
  document.getElementById('hero-titulo').textContent = h.titulo;
  document.getElementById('hero-paragrafos').innerHTML =
    h.paragrafos.map(function(p){ return '<p>' + p + '</p>'; }).join('');

  var botao = document.getElementById('hero-botao');
  botao.textContent = h.botaoTexto;
  botao.href = h.botaoHref;

  var foto = document.getElementById('hero-foto');
  foto.src = h.fotoUrl;
  foto.alt = h.fotoAlt;
}

function materiaCardHTML(item, toggleTexto, linkTexto){
  var paragrafos = item.textoCompleto.map(function(p){ return '<p>' + p + '</p>'; }).join('');
  return (
    '<div class="materia" onclick="toggleMateria(this)">' +
      '<img class="materia-capa" src="' + item.capaUrl + '" alt="' + item.capaAlt + '">' +
      '<div class="materia-corpo">' +
        '<span class="materia-tag">' + item.tag + '</span>' +
        '<h3>' + item.titulo + '</h3>' +
        '<p class="materia-resumo">' + item.resumo + '</p>' +
        '<div class="materia-toggle">' + toggleTexto + ' <span class="seta">▾</span></div>' +
        '<div class="materia-completa">' +
          paragrafos +
          '<a href="' + item.link + '" target="_blank" onclick="event.stopPropagation()">' + linkTexto + '</a>' +
        '</div>' +
      '</div>' +
    '</div>'
  );
}

function renderMateriaSecao(containerId, tituloId, secao){
  document.getElementById(tituloId).textContent = secao.tituloSecao;
  document.getElementById(containerId).innerHTML = secao.itens
    .map(function(item){ return materiaCardHTML(item, secao.toggleTexto, secao.linkTexto); })
    .join('');
}

function renderCurriculo(){
  document.getElementById('titulo-curriculo').textContent = content.curriculo.tituloSecao;
  document.getElementById('lista-timeline').innerHTML = content.curriculo.itens.map(function(item){
    return (
      '<div class="timeline-item">' +
        '<div class="timeline-data">' + item.data + '</div>' +
        '<h3>' + item.titulo + '</h3>' +
        '<p>' + item.descricao + '</p>' +
      '</div>'
    );
  }).join('');
}

function renderBlog(){
  document.getElementById('titulo-blog').textContent = content.blog.tituloSecao;
  document.getElementById('lista-blog').innerHTML = content.blog.itens.map(function(item){
    return (
      '<div class="blog-item">' +
        '<div class="blog-data">' + item.data + '</div>' +
        '<div>' +
          '<h3>' + item.titulo + '</h3>' +
          '<p>' + item.resumo + '</p>' +
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
    return '<a href="' + r.url + '" target="_blank">' + r.nome + '</a>';
  }).join('');
}

function renderFooter(){
  document.getElementById('footer-texto').textContent = content.footer;
}

document.addEventListener('DOMContentLoaded', function(){
  renderHeader();
  renderHero();
  renderMateriaSecao('grid-redacao', 'titulo-redacao', content.redacao);
  renderMateriaSecao('grid-recentes', 'titulo-recentes', content.trabalhosRecentes);
  renderMateriaSecao('grid-faculdade', 'titulo-faculdade', content.faculdade);
  renderCurriculo();
  renderBlog();
  renderContato();
  renderFooter();

  document.querySelectorAll('.materia-completa').forEach(function(el){
    el.addEventListener('click', function(e){ e.stopPropagation(); });
  });
});
