const GITHUB_OWNER = "Maria-Lima-Portifolio";
const GITHUB_REPO = "Maria-Lima-Portifolio.github.io";
const GITHUB_BRANCH = "main";

function escapeHtml(str){
  return String(str == null ? '' : str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function escapeAttr(str){
  return escapeHtml(str).replace(/"/g,'&quot;');
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

// ---------- criação dos blocos repetíveis (itens) ----------

function wireRemover(div, containerSelector){
  div.querySelector('.btn-remover').addEventListener('click', function(){ div.remove(); });
}

function addMateriaItem(containerId, item){
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

  document.getElementById(containerId).appendChild(div);
}

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

function addBlogItem(item){
  var div = document.createElement('div');
  div.className = 'item-editor';
  div.innerHTML =
    '<button class="btn-remover" type="button">Remover</button>' +
    '<div class="linha-2">' +
      '<div class="campo"><label>Data</label><input type="text" class="f-data" value="' + escapeAttr(item.data || '') + '"></div>' +
      '<div class="campo"><label>Título</label><input type="text" class="f-titulo" value="' + escapeAttr(item.titulo || '') + '"></div>' +
    '</div>' +
    '<div class="campo"><label>Resumo</label><textarea class="f-resumo" style="min-height:60px;">' + escapeHtml(item.resumo || '') + '</textarea></div>';
  wireRemover(div);
  document.getElementById('blog-itens').appendChild(div);
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

// ---------- carregar dados atuais (vindos de content.js) no formulário ----------

function renderInit(){
  document.getElementById('f-logo-primeiro').value = content.logoPrimeiroNome;
  document.getElementById('f-logo-sobrenome').value = content.logoSobrenome;

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

  document.getElementById('f-redacao-titulo').value = content.redacao.tituloSecao;
  content.redacao.itens.forEach(function(item){ addMateriaItem('redacao-itens', item); });

  document.getElementById('f-recentes-titulo').value = content.trabalhosRecentes.tituloSecao;
  content.trabalhosRecentes.itens.forEach(function(item){ addMateriaItem('recentes-itens', item); });

  document.getElementById('f-faculdade-titulo').value = content.faculdade.tituloSecao;
  content.faculdade.itens.forEach(function(item){ addMateriaItem('faculdade-itens', item); });

  document.getElementById('f-curriculo-titulo').value = content.curriculo.tituloSecao;
  content.curriculo.itens.forEach(addCurriculoItem);

  document.getElementById('f-blog-titulo').value = content.blog.tituloSecao;
  content.blog.itens.forEach(addBlogItem);

  document.getElementById('f-contato-titulo').value = content.contato.tituloSecao;
  document.getElementById('f-contato-texto').value = content.contato.texto;
  document.getElementById('f-contato-email').value = content.contato.email;
  document.getElementById('f-contato-redes-texto').value = content.contato.redesTexto;
  content.contato.redes.forEach(addRedeItem);

  document.getElementById('f-footer').value = content.footer;
}

// ---------- ler os dados do formulário de volta ----------

function lerMaterias(containerId){
  return Array.from(document.querySelectorAll('#' + containerId + ' .item-editor')).map(function(div){
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
function lerCurriculo(){
  return Array.from(document.querySelectorAll('#curriculo-itens .item-editor')).map(function(div){
    return {
      data: div.querySelector('.f-data').value,
      titulo: div.querySelector('.f-titulo').value,
      descricao: div.querySelector('.f-descricao').value
    };
  });
}
function lerBlog(){
  return Array.from(document.querySelectorAll('#blog-itens .item-editor')).map(function(div){
    return {
      data: div.querySelector('.f-data').value,
      titulo: div.querySelector('.f-titulo').value,
      resumo: div.querySelector('.f-resumo').value
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
      nav: content.nav,
      hero: {
        kicker: document.getElementById('f-hero-kicker').value,
        titulo: document.getElementById('f-hero-titulo').value,
        paragrafos: document.getElementById('f-hero-paragrafos').value.split(/\n\s*\n/).map(function(p){ return p.trim(); }).filter(Boolean),
        botaoTexto: document.getElementById('f-hero-botao').value,
        botaoHref: content.hero.botaoHref,
        fotoUrl: document.getElementById('f-hero-foto-url').value,
        fotoAlt: content.hero.fotoAlt
      },
      redacao: {
        tituloSecao: document.getElementById('f-redacao-titulo').value,
        toggleTexto: content.redacao.toggleTexto,
        linkTexto: content.redacao.linkTexto,
        itens: lerMaterias('redacao-itens')
      },
      trabalhosRecentes: {
        tituloSecao: document.getElementById('f-recentes-titulo').value,
        toggleTexto: content.trabalhosRecentes.toggleTexto,
        linkTexto: content.trabalhosRecentes.linkTexto,
        itens: lerMaterias('recentes-itens')
      },
      faculdade: {
        tituloSecao: document.getElementById('f-faculdade-titulo').value,
        toggleTexto: content.faculdade.toggleTexto,
        linkTexto: content.faculdade.linkTexto,
        itens: lerMaterias('faculdade-itens')
      },
      curriculo: {
        tituloSecao: document.getElementById('f-curriculo-titulo').value,
        itens: lerCurriculo()
      },
      blog: {
        tituloSecao: document.getElementById('f-blog-titulo').value,
        itens: lerBlog()
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

    for (const secaoKey of ['redacao', 'trabalhosRecentes', 'faculdade']){
      for (let i = 0; i < payload[secaoKey].itens.length; i++){
        var item = payload[secaoKey].itens[i];
        if(item._capaFile){
          item.capaUrl = await enviarImagem(item._capaFile, secaoKey + '-' + i, token);
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

  document.querySelectorAll('.btn-adicionar').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.preventDefault();
      var secao = btn.dataset.secao;
      if(secao === 'redacao') addMateriaItem('redacao-itens', {textoCompleto: ['']});
      else if(secao === 'recentes') addMateriaItem('recentes-itens', {textoCompleto: ['']});
      else if(secao === 'faculdade') addMateriaItem('faculdade-itens', {textoCompleto: ['']});
      else if(secao === 'curriculo') addCurriculoItem({});
      else if(secao === 'blog') addBlogItem({});
      else if(secao === 'redes') addRedeItem({});
    });
  });

  document.getElementById('btn-publicar').addEventListener('click', publicar);
});
