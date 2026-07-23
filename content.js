// ============================================================
// CONTEÚDO DO SITE
// Edite só este arquivo para trocar textos, fotos e links.
// Depois de salvar, dê F5 na página para ver as mudanças.
// Não precisa mexer em index.html, style.css ou script.js.
// ============================================================

const content = {

  logoPrimeiroNome: "Nome",
  logoSobrenome: "Sobrenome",

  nav: [
    { texto: "Sobre",     href: "#sobre" },
    { texto: "Redação",   href: "#redacao" },
    { texto: "Faculdade", href: "#faculdade" },
    { texto: "Currículo", href: "#curriculo" },
    { texto: "Blog",      href: "#blog" },
    { texto: "Contato",   href: "#contato" }
  ],

  hero: {
    kicker: "Jornalista & Comunicadora",
    titulo: "Conheça mais sobre mim",
    paragrafos: [
      "Olá, sou [Seu Nome], jornalista formada em [Universidade]. Atuo há [X] anos como redatora e produtora de conteúdo, com foco em [temas: política, cultura, esportes, sociedade].",
      "Minha paixão pelo jornalismo nasceu em [contexto de origem] e se transformou em uma carreira dedicada a dar voz a narrativas relevantes e ampliar o protagonismo de vozes sub-representadas."
    ],
    botaoTexto: "Entre em contato",
    botaoHref: "#contato",
    // troque pela URL da sua foto (pode ser um link do Google Drive/Imgur, ou um arquivo na mesma pasta, ex: "foto.jpg")
    fotoUrl: "https://via.placeholder.com/500x625/e5e2dc/1a1a1a?text=Sua+Foto",
    fotoAlt: "Foto da jornalista"
  },

  // Cada seção de "matérias" tem um título, os textos dos botões, e a lista de itens (cards).
  redacao: {
    tituloSecao: "Redação",
    toggleTexto: "Ler matéria completa",
    linkTexto: "Ver publicação original →",
    itens: [
      {
        tag: "Veículo A",
        capaUrl: "https://via.placeholder.com/400x300/e5e2dc/1a1a1a?text=Capa+da+Mat%C3%A9ria",
        capaAlt: "Capa da matéria",
        titulo: "Título da matéria ou reportagem publicada",
        resumo: "Breve resumo de uma ou duas linhas sobre o conteúdo da matéria e sua relevância.",
        textoCompleto: [
          "Aqui entra o texto completo da matéria, ou um trecho maior dela. Pode colar vários parágrafos — o card expande e o leitor rola a página normalmente para acompanhar.",
          "Segundo parágrafo com mais contexto, detalhes da apuração ou da entrevista."
        ],
        link: "#"
      },
      {
        tag: "Veículo B",
        capaUrl: "https://via.placeholder.com/400x300/e5e2dc/1a1a1a?text=Capa+da+Mat%C3%A9ria",
        capaAlt: "Capa da matéria",
        titulo: "Título de outra matéria de destaque",
        resumo: "Breve resumo de uma ou duas linhas sobre o conteúdo da matéria e sua relevância.",
        textoCompleto: [
          "Texto completo ou trecho maior da matéria aqui."
        ],
        link: "#"
      },
      {
        tag: "Veículo C",
        capaUrl: "https://via.placeholder.com/400x300/e5e2dc/1a1a1a?text=Capa+da+Mat%C3%A9ria",
        capaAlt: "Capa da matéria",
        titulo: "Entrevista ou reportagem especial",
        resumo: "Breve resumo de uma ou duas linhas sobre o conteúdo da matéria e sua relevância.",
        textoCompleto: [
          "Texto completo ou trecho maior da matéria aqui."
        ],
        link: "#"
      }
    ]
  },

  trabalhosRecentes: {
    tituloSecao: "Trabalhos recentes",
    toggleTexto: "Ler mais",
    linkTexto: "Ver mais →",
    itens: [
      {
        tag: "Projeto / Programa",
        capaUrl: "https://via.placeholder.com/400x300/e5e2dc/1a1a1a?text=Capa+do+Projeto",
        capaAlt: "Capa do projeto",
        titulo: "Nome do projeto ou programa apresentado",
        resumo: "Descreva o projeto, seu papel (apresentação, roteiro, edição) e o contexto.",
        textoCompleto: [
          "Detalhes completos sobre o projeto: contexto, papel desempenhado, resultados alcançados."
        ],
        link: "#"
      },
      {
        tag: "Colaboração",
        capaUrl: "https://via.placeholder.com/400x300/e5e2dc/1a1a1a?text=Capa+do+Projeto",
        capaAlt: "Capa do projeto",
        titulo: "Outro trabalho ou parceria recente",
        resumo: "Descreva o projeto, seu papel e o contexto em que foi produzido.",
        textoCompleto: [
          "Detalhes completos sobre o projeto: contexto, papel desempenhado, resultados alcançados."
        ],
        link: "#"
      },
      {
        tag: "Produção",
        capaUrl: "https://via.placeholder.com/400x300/e5e2dc/1a1a1a?text=Capa+do+Projeto",
        capaAlt: "Capa do projeto",
        titulo: "Terceiro trabalho em destaque",
        resumo: "Descreva o projeto, seu papel e o contexto em que foi produzido.",
        textoCompleto: [
          "Detalhes completos sobre o projeto: contexto, papel desempenhado, resultados alcançados."
        ],
        link: "#"
      }
    ]
  },

  faculdade: {
    tituloSecao: "Trabalhos da Faculdade",
    toggleTexto: "Ler mais",
    linkTexto: "Ver trabalho completo →",
    itens: [
      {
        tag: "Disciplina / Curso",
        capaUrl: "https://via.placeholder.com/400x300/e5e2dc/1a1a1a?text=Capa+do+Trabalho",
        capaAlt: "Capa do trabalho",
        titulo: "Nome do trabalho acadêmico ou TCC",
        resumo: "Breve resumo sobre o trabalho, sua proposta e o contexto da disciplina.",
        textoCompleto: [
          "Texto completo sobre o trabalho: objetivo, metodologia, resultados ou aprendizados."
        ],
        link: "#"
      },
      {
        tag: "Disciplina / Curso",
        capaUrl: "https://via.placeholder.com/400x300/e5e2dc/1a1a1a?text=Capa+do+Trabalho",
        capaAlt: "Capa do trabalho",
        titulo: "Outro trabalho acadêmico relevante",
        resumo: "Breve resumo sobre o trabalho, sua proposta e o contexto da disciplina.",
        textoCompleto: [
          "Texto completo sobre o trabalho: objetivo, metodologia, resultados ou aprendizados."
        ],
        link: "#"
      },
      {
        tag: "Disciplina / Curso",
        capaUrl: "https://via.placeholder.com/400x300/e5e2dc/1a1a1a?text=Capa+do+Trabalho",
        capaAlt: "Capa do trabalho",
        titulo: "Terceiro trabalho da graduação",
        resumo: "Breve resumo sobre o trabalho, sua proposta e o contexto da disciplina.",
        textoCompleto: [
          "Texto completo sobre o trabalho: objetivo, metodologia, resultados ou aprendizados."
        ],
        link: "#"
      }
    ]
  },

  curriculo: {
    tituloSecao: "Currículo & Experiência",
    itens: [
      { data: "2024 — Atual",  titulo: "Cargo atual, Empresa/Veículo",           descricao: "Descrição breve das responsabilidades e principais entregas nessa posição." },
      { data: "2022 — 2024",   titulo: "Cargo anterior, Empresa/Veículo",        descricao: "Descrição breve das responsabilidades e principais entregas nessa posição." },
      { data: "Formação",      titulo: "Graduação em Jornalismo — Universidade", descricao: "Ano de conclusão e eventuais especializações, cursos ou certificações relevantes." }
    ]
  },

  blog: {
    tituloSecao: "Blog & Artigos",
    itens: [
      { data: "12 Jul 2026", titulo: "Título do artigo ou post do blog",   resumo: "Um parágrafo curto introduzindo o tema do artigo, convidando o leitor a continuar." },
      { data: "28 Jun 2026", titulo: "Outro título de artigo relevante",   resumo: "Um parágrafo curto introduzindo o tema do artigo, convidando o leitor a continuar." },
      { data: "05 Jun 2026", titulo: "Terceiro artigo do blog",            resumo: "Um parágrafo curto introduzindo o tema do artigo, convidando o leitor a continuar." }
    ]
  },

  contato: {
    tituloSecao: "Contato & Redes Sociais",
    texto: "Se você quiser compartilhar algo comigo, propor um projeto, uma pauta ou apenas bater um papo, envie um e-mail:",
    email: "seuemail@exemplo.com",
    redesTexto: "Acompanhe meu trabalho também nas redes sociais:",
    redes: [
      { nome: "LinkedIn",  url: "#" },
      { nome: "Instagram", url: "#" },
      { nome: "TikTok",    url: "#" }
    ]
  },

  footer: "© 2026 [Seu Nome] — Portfólio Jornalístico"
};
