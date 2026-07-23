const GITHUB_OWNER = "Maria-Lima-Portifolio";
const GITHUB_REPO = "Maria-Lima-Portifolio.github.io";
const GITHUB_BRANCH = "main";

function escapeHtml(str){
  return String(str == null ? '' : str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function escapeAttr(str){
  return escapeHtml(str).replace(/"/g,'&quot;');
}
function slugify(str){
  var s = String(str || '').toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return s || ('secao-' + Date.now());
}

async function mensagemErroGithub(resp){
  if(resp.status === 401) return 'chave de acesso inválida ou expirada. Gere uma nova em github.com/settings/personal-access-tokens e salve de novo no painel.';
  if(resp.status === 403) return 'a chave de acesso não tem permissão para editar este site. Confira se ela foi criada com "Contents: Read and write" para este repositório.';
  if(resp.status === 409) return 'o site foi alterado em outro lugar enquanto você editava. Atualize a página (F5) e tente publicar de novo.';
  var corpo = await resp.json().catch(function(){ return {}; });
  return 'erro ' + resp.status + ': ' + (corpo.message || 'erro desconhecido');
}

function githubUrl(caminho){
  return 'https://api.github.com/repos/' + GITHUB_OWNER + '/' + GITHUB_REPO + '/contents/' + caminho;
}
function siteUrl(){
  var ehRepoDeUsuario = GITHUB_REPO.toLowerCase() === (GITHUB_OWNER.toLowerCase() + '.github.io');
  return ehRepoDeUsuario
    ? 'https://' + GITHUB_OWNER.toLowerCase() + '.github.io/'
    : 'https://' + GITHUB_OWNER.toLowerCase() + '.github.io/' + GITHUB_REPO + '/';
}
function githubHeaders(token){
  return {
    'Authorization': 'Bearer ' + token,
    'Accept': 'application/vnd.github+json',
    'Content-Type': 'application/json'
  };
}
function arrayBufferToBase64(buffer){
  var binary = '';
  var bytes = new Uint8Array(buffer);
  var chunk = 0x8000;
  for (var i = 0; i < bytes.length; i += chunk){
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}
function utf8ToBase64(str){
  var bytes = new TextEncoder().encode(str);
  var binary = '';
  var chunk = 0x8000;
  for (var i = 0; i < bytes.length; i += chunk){
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function mostrarStatus(tipo, mensagemHtml){
  var el = document.getElementById('status');
  el.className = 'status ' + tipo;
  el.innerHTML = mensagemHtml;
}

function atualizarEstadoToken(){
  var tem = !!localStorage.getItem('gh_token');
  document.getElementById('token-oculto').style.display = tem ? 'none' : 'block';
  document.getElementById('token-visivel').style.display = tem ? 'flex' : 'none';
}

// ---------- itens repetíveis dentro de uma seção (matérias/trabalhos) ----------

function wireRemover(div){
  div.querySelector('.btn-remover').addEventListener('click', function(){ div.remove(); });
}

function addMateriaItem(container, item){
  var div = document.createElement('div');
  div.className = 'item-editor';
  div.innerHTML =
    '<button class="btn-remover" type="button">Remover</button>' +
    '<img class="capa-preview f-capa-preview" src="' + escapeAttr(item.capaUrl || '') + '">' +
    '<div class="campo"><label>Link da imagem (ou envie um arquivo abaixo)</label>' +
      '<input type="url" class="f-capa-url" value="' + escapeAttr(item.capaUrl || '') + '"></div>' +
    '<div class="campo"><label>Ou escolha um arquivo de imagem</label>' +
      '<input type="file" class="f-capa-file" accept="image/*"></div>' +
    '<div class="linha-2">' +
      '<div class="campo"><label>Categoria / Veículo</label><input type="text" class="f-tag" value="' + escapeAttr(item.tag || '') + '"></div>' +
      '<div class="campo"><label>Link "ver mais"</label><input type="text" class="f-link" value="' + escapeAttr(item.link || '#') + '"></div>' +
    '</div>' +
    '<div class="campo"><label>Título</label><input type="text" class="f-titulo" value="' + escapeAttr(item.titulo || '') + '"></div>' +
    '<div class="campo"><label>Resumo curto</label><textarea class="f-resumo" style="min-height:60px;">' + escapeHtml(item.resumo || '') + '</textarea></div>' +
    '<div class="campo"><label>Texto completo (parágrafos separados por linha em branco)</label>' +
      '<textarea class="f-texto" style="min-height:120px;">' + escapeHtml((item.textoCompleto || []).join('\n\n')) + '</textarea></div>';

  wireRemover(div);
  var fileInput = div.querySelector('.f-capa-file');
  var preview = div.querySelector('.f-capa-preview');
  var urlInput = div.querySelector('.f-capa-url');
  fileInput.addEventListener('change', function(){
    if(fileInput.files[0]) preview.src = URL.createObjectURL(fileInput.files[0]);
  });
  urlInput.addEventListener('input', function(){ preview.src = urlInput.value; });

  container.appendChild(div);
}

function lerMaterias(container){
  return Array.from(container.querySelectorAll(':scope > .item-editor')).map(function(div){
    var titulo = div.querySelector('.f-titulo').value;
    return {
      tag: div.querySelector('.f-tag').value,
      capaUrl: div.querySelector('.f-capa-url').value,
      capaAlt: titulo,
      titulo: titulo,
      resumo: div.querySelector('.f-resumo').value,
      textoCompleto: div.querySelector('.f-texto').value.split(/\n\s*\n/).map(function(p){ return p.trim(); }).filter(Boolean),
      link: div.querySelector('.f-link').value,
      _capaFile: div.querySelector('.f-capa-file').files[0] || null
    };
  });
}

// ---------- seções (Redação, Faculdade, Campeonatos, e as que ela criar) ----------

function criarSecaoPainel(secao){
  var div = document.createElement('div');
  div.className = 'painel secao-painel';
  div.dataset.secaoId = secao.id || slugify(secao.titulo || 'nova-secao');

  div.innerHTML =
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;">' +
      '<h2 style="border-bottom:none;padding-bottom:0;margin-bottom:0;">Seção</h2>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
        '<button class="btn-secundario btn-mover-cima" type="button">▲ Mover</button>' +
        '<button class="btn-secundario btn-mover-baixo" type="button">▼ Mover</button>' +
        '<button class="btn-secundario btn-remover-secao" type="button">Remover seção</button>' +
      '</div>' +
    '</div>' +
    '<p class="ajuda">Endereço desta seção (use no menu de navegação acima se quiser uma aba pra ela): <strong>#' + escapeHtml(div.dataset.secaoId) + '</strong></p>' +
    '<div class="campo"><label>Nome da seção (aparece como título)</label><input type="text" class="f-secao-titulo" value="' + escapeAttr(secao.titulo || '') + '"></div>' +
    '<div class="linha-2">' +
      '<div class="campo"><label>Texto do botão "ler mais" de cada card</label><input type="text" class="f-secao-toggle" value="' + escapeAttr(secao.toggleTexto || 'Ler mais') + '"></div>' +
      '<div class="campo"><label>Texto do link dentro do card expandido</label><input type="text" class="f-secao-link" value="' + escapeAttr(secao.linkTexto || 'Ver mais →') + '"></div>' +
    '</div>' +
    '<div class="linha-2">' +
      '<div class="campo"><label>Quantos cards aparecem antes do botão "ver todas"</label><input type="text" inputmode="numeric" class="f-secao-visiveis" value="' + escapeAttr(secao.visiveis || 4) + '"></div>' +
      '<div class="campo"><label>Texto do botão "ver todas"</label><input type="text" class="f-secao-vertodas" value="' + escapeAttr(secao.verTodasTexto || 'Ver todas') + '"></div>' +
    '</div>' +
    '<div class="campo">' +
      '<label>Fundo da seção</label>' +
      '<select class="f-secao-fundo">' +
        '<option value="nenhum">Nenhum (fundo normal do site)</option>' +
        '<option value="campo">Campo de futebol (desenhado)</option>' +
        '<option value="imagem">Foto enviada por mim</option>' +
      '</select>' +
    '</div>' +
    '<div class="campo f-secao-fundo-imagem-campos">' +
      '<img class="capa-preview f-secao-fundo-preview" src="' + escapeAttr(secao.fundoImagemUrl || '') + '">' +
      '<label>Link da imagem de fundo (ou envie um arquivo abaixo)</label>' +
      '<input type="url" class="f-secao-fundo-url" value="' + escapeAttr(secao.fundoImagemUrl || '') + '">' +
      '<label style="margin-top:8px;">Ou escolha um arquivo do computador</label>' +
      '<input type="file" class="f-secao-fundo-file" accept="image/*">' +
    '</div>' +
    '<div class="secao-itens"></div>' +
    '<button class="btn-adicionar btn-adicionar-item" type="button">+ Adicionar item</button>';

  div.querySelector('.f-secao-fundo').value = secao.fundo || 'nenhum';

  var itensContainer = div.querySelector('.secao-itens');
  (secao.itens || []).forEach(function(item){ addMateriaItem(itensContainer, item); });

  div.querySelector('.btn-adicionar-item').addEventListener('click', function(){
    addMateriaItem(itensContainer, { textoCompleto: [''] });
  });

  div.querySelector('.btn-remover-secao').addEventListener('click', function(){
    if(confirm('Remover esta seção inteira e todos os itens dentro dela?')) div.remove();
  });
  div.querySelector('.btn-mover-cima').addEventListener('click', function(){
    var anterior = div.previousElementSibling;
    if(anterior) div.parentNode.insertBefore(div, anterior);
  });
  div.querySelector('.btn-mover-baixo').addEventListener('click', function(){
    var proximo = div.nextElementSibling;
    if(proximo) div.parentNode.insertBefore(proximo, div);
  });

  var fundoSelect = div.querySelector('.f-secao-fundo');
  var camposImagem = div.querySelector('.f-secao-fundo-imagem-campos');
  function atualizarVisibilidadeFundo(){
    camposImagem.style.display = fundoSelect.value === 'imagem' ? 'block' : 'none';
  }
  fundoSelect.addEventListener('change', atualizarVisibilidadeFundo);
  atualizarVisibilidadeFundo();

  var fundoPreview = div.querySelector('.f-secao-fundo-preview');
  var fundoUrl = div.querySelector('.f-secao-fundo-url');
  var fundoFile = div.querySelector('.f-secao-fundo-file');
  fundoUrl.addEventListener('input', function(){ fundoPreview.src = fundoUrl.value; });
  fundoFile.addEventListener('change', function(){
    if(fundoFile.files[0]) fundoPreview.src = URL.createObjectURL(fundoFile.files[0]);
  });

  return div;
}

function lerSecoes(){
  return Array.from(document.querySelectorAll('#secoes-painel-container .secao-painel')).map(function(div){
    return {
      id: div.dataset.secaoId,
      titulo: div.querySelector('.f-secao-titulo').value,
      toggleTexto: div.querySelector('.f-secao-toggle').value,
      linkTexto: div.querySelector('.f-secao-link').value,
      verTodasTexto: div.querySelector('.f-secao-vertodas').value,
      visiveis: parseInt(div.querySelector('.f-secao-visiveis').value, 10) || 4,
      fundo: div.querySelector('.f-secao-fundo').value,
      fundoImagemUrl: div.querySelector('.f-secao-fundo-url').value,
      _fundoFile: div.querySelector('.f-secao-fundo-file').files[0] || null,
      itens: lerMaterias(div.querySelector('.secao-itens'))
    };
  });
}

// ---------- menu de navegação ----------

function addNavItem(item){
  var div = document.createElement('div');
  div.className = 'item-editor';
  div.innerHTML =
    '<button class="btn-remover" type="button">Remover</button>' +
    '<div class="linha-2">' +
      '<div class="campo"><label>Texto da aba</label><input type="text" class="f-nav-texto" value="' + escapeAttr(item.texto || '') + '"></div>' +
      '<div class="campo"><label>Link (ex: #contato)</label><input type="text" class="f-nav-href" value="' + escapeAttr(item.href || '') + '"></div>' +
    '</div>';
  wireRemover(div);
  document.getElementById('nav-itens').appendChild(div);
}
function lerNav(){
  return Array.from(document.querySelectorAll('#nav-itens .item-editor')).map(function(div){
    return {
      texto: div.querySelector('.f-nav-texto').value,
      href: div.querySelector('.f-nav-href').value
    };
  });
}

// ---------- itens repetíveis simples (currículo, certificados, redes) ----------

function addCurriculoItem(item){
  var div = document.createElement('div');
  div.className = 'item-editor';
  div.innerHTML =
    '<button class="btn-remover" type="button">Remover</button>' +
    '<div class="linha-2">' +
      '<div class="campo"><label>Período / Data</label><input type="text" class="f-data" value="' + escapeAttr(item.data || '') + '"></div>' +
      '<div class="campo"><label>Cargo / Título</label><input type="text" class="f-titulo" value="' + escapeAttr(item.titulo || '') + '"></div>' +
    '</div>' +
    '<div class="campo"><label>Descrição</label><textarea class="f-descricao" style="min-height:70px;">' + escapeHtml(item.descricao || '') + '</textarea></div>';
  wireRemover(div);
  document.getElementById('curriculo-itens').appendChild(div);
}

function addCertificadoItem(item){
  var div = document.createElement('div');
  div.className = 'item-editor';
  div.innerHTML =
    '<button class="btn-remover" type="button">Remover</button>' +
    '<div class="campo"><label>Nome do certificado / curso</label><input type="text" class="f-titulo" value="' + escapeAttr(item.titulo || '') + '"></div>' +
    '<div class="linha-2">' +
      '<div class="campo"><label>Instituição</label><input type="text" class="f-instituicao" value="' + escapeAttr(item.instituicao || '') + '"></div>' +
      '<div class="campo"><label>Ano / período</label><input type="text" class="f-ano" value="' + escapeAttr(item.ano || '') + '"></div>' +
    '</div>';
  wireRemover(div);
  document.getElementById('certificados-itens').appendChild(div);
}

function addRedeItem(item){
  var div = document.createElement('div');
  div.className = 'item-editor';
  div.innerHTML =
    '<button class="btn-remover" type="button">Remover</button>' +
    '<div class="linha-2">' +
      '<div class="campo"><label>Nome da rede (ex: Instagram)</label><input type="text" class="f-nome" value="' + escapeAttr(item.nome || '') + '"></div>' +
      '<div class="campo"><label>Link do perfil</label><input type="text" class="f-url" value="' + escapeAttr(item.url || '') + '"></div>' +
    '</div>';
  wireRemover(div);
  document.getElementById('contato-redes-itens').appendChild(div);
}

function lerCurriculo(){
  return Array.from(document.querySelectorAll('#curriculo-itens .item-editor')).map(function(div){
    return {
      data: div.querySelector('.f-data').value,
      titulo: div.querySelector('.f-titulo').value,
      descricao: div.querySelector('.f-descricao').value
    };
  });
}
function lerCertificados(){
  return Array.from(document.querySelectorAll('#certificados-itens .item-editor')).map(function(div){
    return {
      titulo: div.querySelector('.f-titulo').value,
      instituicao: div.querySelector('.f-instituicao').value,
      ano: div.querySelector('.f-ano').value
    };
  });
}
function lerRedes(){
  return Array.from(document.querySelectorAll('#contato-redes-itens .item-editor')).map(function(div){
    return {
      nome: div.querySelector('.f-nome').value,
      url: div.querySelector('.f-url').value
    };
  });
}

// ---------- carregar dados atuais (vindos de content.js) no formulário ----------

function renderInit(){
  document.getElementById('f-logo-primeiro').value = content.logoPrimeiroNome;
  document.getElementById('f-logo-sobrenome').value = content.logoSobrenome;

  content.nav.forEach(addNavItem);

  document.getElementById('f-hero-kicker').value = content.hero.kicker;
  document.getElementById('f-hero-titulo').value = content.hero.titulo;
  document.getElementById('f-hero-paragrafos').value = content.hero.paragrafos.join('\n\n');
  document.getElementById('f-hero-botao').value = content.hero.botaoTexto;
  document.getElementById('f-hero-foto-url').value = content.hero.fotoUrl;
  document.getElementById('f-hero-foto-preview').src = content.hero.fotoUrl;
  document.getElementById('f-hero-foto-url').addEventListener('input', function(e){
    document.getElementById('f-hero-foto-preview').src = e.target.value;
  });
  document.getElementById('f-hero-foto-arquivo').addEventListener('change', function(e){
    if(e.target.files[0]) document.getElementById('f-hero-foto-preview').src = URL.createObjectURL(e.target.files[0]);
  });

  var secoesContainer = document.getElementById('secoes-painel-container');
  content.secoes.forEach(function(secao){
    secoesContainer.appendChild(criarSecaoPainel(secao));
  });

  document.getElementById('f-curriculo-titulo').value = content.curriculo.tituloSecao;
  content.curriculo.itens.forEach(addCurriculoItem);

  document.getElementById('f-certificados-titulo').value = content.certificados.tituloSecao;
  content.certificados.itens.forEach(addCertificadoItem);

  document.getElementById('f-contato-titulo').value = content.contato.tituloSecao;
  document.getElementById('f-contato-texto').value = content.contato.texto;
  document.getElementById('f-contato-email').value = content.contato.email;
  document.getElementById('f-contato-redes-texto').value = content.contato.redesTexto;
  content.contato.redes.forEach(addRedeItem);

  document.getElementById('f-footer').value = content.footer;
}

// ---------- publicar no GitHub ----------

async function enviarImagem(file, slug, token){
  var buffer = await file.arrayBuffer();
  var base64 = arrayBufferToBase64(buffer);
  var ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  var caminho = 'images/' + slug + '-' + Date.now() + '.' + ext;

  var resp = await fetch(githubUrl(caminho), {
    method: 'PUT',
    headers: githubHeaders(token),
    body: JSON.stringify({
      message: 'Envia imagem via painel',
      content: base64,
      branch: GITHUB_BRANCH
    })
  });
  if(!resp.ok){
    throw new Error('falha ao enviar imagem: ' + (await mensagemErroGithub(resp)));
  }
  return caminho;
}

async function publicarContentJs(payload, token){
  var caminho = 'content.js';
  var shaAtual = null;

  var getResp = await fetch(githubUrl(caminho) + '?ref=' + GITHUB_BRANCH, { headers: githubHeaders(token) });
  if(getResp.ok){
    shaAtual = (await getResp.json()).sha;
  } else if(getResp.status !== 404){
    throw new Error('não consegui ler o content.js atual: ' + (await mensagemErroGithub(getResp)));
  }

  var texto = 'const content = ' + JSON.stringify(payload, null, 2) + ';\n';
  var body = {
    message: 'Atualiza conteúdo do site via painel',
    content: utf8ToBase64(texto),
    branch: GITHUB_BRANCH
  };
  if(shaAtual) body.sha = shaAtual;

  var putResp = await fetch(githubUrl(caminho), {
    method: 'PUT',
    headers: githubHeaders(token),
    body: JSON.stringify(body)
  });
  if(!putResp.ok){
    throw new Error('falha ao salvar: ' + (await mensagemErroGithub(putResp)));
  }
}

async function publicar(){
  var token = localStorage.getItem('gh_token');
  if(!token){
    mostrarStatus('erro', 'Cole e salve sua chave de acesso antes de publicar.');
    return;
  }

  var btn = document.getElementById('btn-publicar');
  btn.disabled = true;
  mostrarStatus('carregando', 'Publicando... isso pode levar alguns segundos, principalmente se você enviou fotos novas.');

  try{
    var payload = {
      logoPrimeiroNome: document.getElementById('f-logo-primeiro').value,
      logoSobrenome: document.getElementById('f-logo-sobrenome').value,
      nav: lerNav(),
      hero: {
        kicker: document.getElementById('f-hero-kicker').value,
        titulo: document.getElementById('f-hero-titulo').value,
        paragrafos: document.getElementById('f-hero-paragrafos').value.split(/\n\s*\n/).map(function(p){ return p.trim(); }).filter(Boolean),
        botaoTexto: document.getElementById('f-hero-botao').value,
        botaoHref: content.hero.botaoHref,
        fotoUrl: document.getElementById('f-hero-foto-url').value,
        fotoAlt: content.hero.fotoAlt
      },
      secoes: lerSecoes(),
      curriculo: {
        tituloSecao: document.getElementById('f-curriculo-titulo').value,
        itens: lerCurriculo()
      },
      certificados: {
        tituloSecao: document.getElementById('f-certificados-titulo').value,
        itens: lerCertificados()
      },
      contato: {
        tituloSecao: document.getElementById('f-contato-titulo').value,
        texto: document.getElementById('f-contato-texto').value,
        email: document.getElementById('f-contato-email').value,
        redesTexto: document.getElementById('f-contato-redes-texto').value,
        redes: lerRedes()
      },
      footer: document.getElementById('f-footer').value
    };

    var heroFile = document.getElementById('f-hero-foto-arquivo').files[0];
    if(heroFile){
      payload.hero.fotoUrl = await enviarImagem(heroFile, 'hero', token);
    }

    for (let s = 0; s < payload.secoes.length; s++){
      var secao = payload.secoes[s];
      if(secao.fundo === 'imagem' && secao._fundoFile){
        secao.fundoImagemUrl = await enviarImagem(secao._fundoFile, secao.id + '-fundo', token);
      }
      delete secao._fundoFile;

      for (let i = 0; i < secao.itens.length; i++){
        var item = secao.itens[i];
        if(item._capaFile){
          item.capaUrl = await enviarImagem(item._capaFile, secao.id + '-' + i, token);
        }
        delete item._capaFile;
      }
    }

    await publicarContentJs(payload, token);

    mostrarStatus('ok', 'Publicado! As mudanças aparecem no site em cerca de 1 minuto. ' +
      '<a href="' + siteUrl() + '" target="_blank">Ver o site</a>');
  } catch(err){
    mostrarStatus('erro', 'Não foi possível publicar: ' + err.message);
  } finally {
    btn.disabled = false;
  }
}

document.addEventListener('DOMContentLoaded', function(){
  renderInit();
  atualizarEstadoToken();

  document.getElementById('btn-salvar-token').addEventListener('click', function(){
    var v = document.getElementById('input-token').value.trim();
    if(!v) return;
    localStorage.setItem('gh_token', v);
    document.getElementById('input-token').value = '';
    atualizarEstadoToken();
  });
  document.getElementById('btn-esquecer-token').addEventListener('click', function(){
    localStorage.removeItem('gh_token');
    atualizarEstadoToken();
  });

  document.getElementById('btn-adicionar-nav').addEventListener('click', function(){
    addNavItem({ texto: 'Nova aba', href: '#' });
  });

  document.getElementById('btn-nova-secao').addEventListener('click', function(){
    var titulo = 'Nova seção';
    var id = slugify(titulo + '-' + Date.now());
    document.getElementById('secoes-painel-container').appendChild(criarSecaoPainel({
      id: id,
      titulo: titulo,
      toggleTexto: 'Ler mais',
      linkTexto: 'Ver mais →',
      verTodasTexto: 'Ver todas',
      visiveis: 4,
      fundo: 'nenhum',
      itens: []
    }));
  });

  document.querySelectorAll('.btn-adicionar[data-secao]').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.preventDefault();
      var secao = btn.dataset.secao;
      if(secao === 'curriculo') addCurriculoItem({});
      else if(secao === 'certificados') addCertificadoItem({});
      else if(secao === 'redes') addRedeItem({});
    });
  });

  document.getElementById('btn-publicar').addEventListener('click', publicar);
});
