/* ==========================================================
   ALINE SANTOS TATTOO — script.js
   Menu mobile, cabeçalho ao rolar, barra de progresso, parallax,
   scrollspy do menu, carrossel, contadores animados, botões
   magnéticos, revelar ao rolar e integração inteligente com WhatsApp.
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {

  const prefereMenosMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const NUMERO_WHATSAPP = "5522999335284"; 

  /* ---------------------------------------------------------
     1. Cabeçalho ao rolar + barra de progresso
     Uma única leitura de scroll por frame (requestAnimationFrame)
     evita disparar cálculos repetidos e mantém a rolagem suave.
  --------------------------------------------------------- */
  const cabecalho = document.getElementById('cabecalho');
  const barraProgresso = document.getElementById('barra-progresso');

  let scrollPendente = false;

  function processarScroll() {
    const scrollAtual = window.scrollY;
    const alturaTotal = document.documentElement.scrollHeight - window.innerHeight;
    const progresso = alturaTotal > 0 ? scrollAtual / alturaTotal : 0;

    cabecalho.classList.toggle('cabecalho--rolado', scrollAtual > 40);
    barraProgresso.style.transform = `scaleX(${progresso})`;

    scrollPendente = false;
  }

  function aoRolar() {
    if (!scrollPendente) {
      scrollPendente = true;
      requestAnimationFrame(processarScroll);
    }
  }

  processarScroll();
  window.addEventListener('scroll', aoRolar, { passive: true });
  window.addEventListener('resize', aoRolar, { passive: true });

  /* ---------------------------------------------------------
     2. Menu mobile (hambúrguer)
  --------------------------------------------------------- */
  const botaoMenu = document.getElementById('botao-menu');
  const menuPrincipal = document.getElementById('menu-principal');

  const fecharMenu = () => {
    menuPrincipal.classList.remove('menu-principal--aberto');
    botaoMenu.setAttribute('aria-expanded', 'false');
  };

  botaoMenu.addEventListener('click', () => {
    const aberto = menuPrincipal.classList.toggle('menu-principal--aberto');
    botaoMenu.setAttribute('aria-expanded', String(aberto));
  });

  const linksMenu = Array.from(menuPrincipal.querySelectorAll('.link-menu'));
  linksMenu.forEach(link => link.addEventListener('click', fecharMenu));

  /* ---------------------------------------------------------
     3. Scrollspy — destaca no menu o link da seção visível
  --------------------------------------------------------- */
  const secoesComId = document.querySelectorAll('main section[id]');

  const observadorMenu = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (!entrada.isIntersecting) return;
      const id = entrada.target.id;
      linksMenu.forEach((link) => {
        link.classList.toggle('link-menu--ativo', link.getAttribute('href') === `#${id}`);
      });
    });
  }, { rootMargin: '-45% 0px -45% 0px' });

  secoesComId.forEach((secao) => observadorMenu.observe(secao));

  /* ---------------------------------------------------------
     4. Parallax suave nas imagens de fundo
     Desloca cada imagem [data-paralaxe] com base em quão perto
     seu contêiner está do centro da tela. Só roda se o usuário
     não pediu "menos movimento" no sistema operacional.
  --------------------------------------------------------- */
  const imagensParalaxe = Array.from(document.querySelectorAll('[data-paralaxe]'));

  function aplicarParalaxe() {
    const alturaJanela = window.innerHeight;
    imagensParalaxe.forEach((img) => {
      const contêiner = img.closest('section') || img.parentElement;
      const retangulo = contêiner.getBoundingClientRect();
      const centroContêiner = retangulo.top + retangulo.height / 2;
      const distanciaDoCentro = centroContêiner - alturaJanela / 2;
      // limita o deslocamento a uma faixa suave, proporcional à distância do centro da tela
      const deslocamento = Math.max(-70, Math.min(70, distanciaDoCentro * 0.08));
      img.style.transform = `translate3d(0, ${deslocamento}px, 0) scale(1.15)`;
    });
  }

  let paralaxePendente = false;
  function aoRolarParalaxe() {
    if (!paralaxePendente) {
      paralaxePendente = true;
      requestAnimationFrame(() => {
        aplicarParalaxe();
        paralaxePendente = false;
      });
    }
  }

  if (imagensParalaxe.length && !prefereMenosMovimento) {
    aplicarParalaxe();
    window.addEventListener('scroll', aoRolarParalaxe, { passive: true });
    window.addEventListener('resize', aoRolarParalaxe, { passive: true });
  }

  /* ---------------------------------------------------------
     5. Carrossel da galeria
  --------------------------------------------------------- */
  const trilha = document.getElementById('trilha-carrossel');
  const itens = Array.from(trilha.children);
  const botaoAnterior = document.getElementById('botao-anterior');
  const botaoProximo = document.getElementById('botao-proximo');
  const containerPontos = document.getElementById('pontos-carrossel');

  let indiceAtual = 0;

  // Gera os pontos indicadores dinamicamente — se o número de fotos mudar,
  // os pontos se ajustam sozinhos, sem precisar editar este arquivo.
  itens.forEach((_, i) => {
    const ponto = document.createElement('button');
    ponto.type = 'button';
    ponto.classList.add('ponto');
    ponto.setAttribute('aria-label', `Ir para trabalho ${i + 1}`);
    ponto.setAttribute('role', 'tab');
    if (i === 0) ponto.classList.add('ponto--ativo');
    ponto.addEventListener('click', () => irParaItem(i));
    containerPontos.appendChild(ponto);
  });
  const pontos = Array.from(containerPontos.children);

  function atualizarCarrossel() {
    const deslocamento = itens[indiceAtual].offsetLeft;
    trilha.style.transform = `translateX(-${deslocamento}px)`;
    pontos.forEach((p, i) => p.classList.toggle('ponto--ativo', i === indiceAtual));
  }

  function irParaItem(i) {
    // o operador módulo (%) faz o índice "dar a volta" nas pontas,
    // criando um carrossel circular sem precisar checar limites manualmente
    indiceAtual = (i + itens.length) % itens.length;
    atualizarCarrossel();
  }

  botaoAnterior.addEventListener('click', () => irParaItem(indiceAtual - 1));
  botaoProximo.addEventListener('click', () => irParaItem(indiceAtual + 1));
  window.addEventListener('resize', atualizarCarrossel);

  // Arraste via Pointer Events: cobre mouse, toque e caneta com uma única API,
  // e o setPointerCapture evita o "arraste travado" quando o clique é solto
  // fora do elemento.
  let posicaoInicial = 0;
  let arrastando = false;

  trilha.addEventListener('pointerdown', (e) => {
    posicaoInicial = e.clientX;
    arrastando = true;
    trilha.setPointerCapture(e.pointerId);
  });

  trilha.addEventListener('pointerup', (e) => {
    if (!arrastando) return;
    arrastando = false;
    const diferenca = posicaoInicial - e.clientX;
    if (Math.abs(diferenca) > 40) {
      diferenca > 0 ? irParaItem(indiceAtual + 1) : irParaItem(indiceAtual - 1);
    }
  });

  trilha.addEventListener('pointercancel', () => { arrastando = false; });

  atualizarCarrossel();

  // Autoplay suave do carrossel (reinicia ao interagir)
  let autoplay = setInterval(() => irParaItem(indiceAtual + 1), 5000);
  const reiniciarAutoplay = () => {
    clearInterval(autoplay);
    autoplay = setInterval(() => irParaItem(indiceAtual + 1), 5000);
  };
  [botaoAnterior, botaoProximo, trilha].forEach(el => el.addEventListener('click', reiniciarAutoplay));

  /* ---------------------------------------------------------
     6. Contadores animados (seção Sobre)
     Anima de 0 até o valor real quando a estatística entra na tela.
     O HTML já traz o valor final como texto — isso é só um reforço
     visual progressivo; sem JavaScript, o número correto continua ali.
  --------------------------------------------------------- */
  const contadores = document.querySelectorAll('[data-contador]');

  function formatarNumero(valor, casasDecimais) {
    return valor.toLocaleString('pt-BR', {
      minimumFractionDigits: casasDecimais,
      maximumFractionDigits: casasDecimais,
    });
  }

  function animarContador(elemento) {
    const valorFinal = parseFloat(elemento.dataset.contador);
    const sufixo = elemento.dataset.sufixo || '';
    const casasDecimais = parseInt(elemento.dataset.decimais || '0', 10);

    if (prefereMenosMovimento) {
      elemento.textContent = formatarNumero(valorFinal, casasDecimais) + sufixo;
      return;
    }

    const duracao = 1400;
    const inicio = performance.now();

    function passo(agora) {
      const progresso = Math.min((agora - inicio) / duracao, 1);
      // easeOutExpo: começa rápido e desacelera suavemente até o valor final
      const facilitado = progresso === 1 ? 1 : 1 - Math.pow(2, -10 * progresso);
      const valorAtual = valorFinal * facilitado;
      elemento.textContent = formatarNumero(valorAtual, casasDecimais) + sufixo;
      if (progresso < 1) requestAnimationFrame(passo);
    }

    requestAnimationFrame(passo);
  }

  const observadorContadores = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        animarContador(entrada.target);
        observadorContadores.unobserve(entrada.target);
      }
    });
  }, { threshold: 0.6 });

  contadores.forEach((el) => observadorContadores.observe(el));

  /* ---------------------------------------------------------
     7. Botões magnéticos — só em telas com mouse de precisão.
     O botão se desloca sutilmente em direção ao cursor, e volta
     ao lugar quando o mouse sai.
  --------------------------------------------------------- */
  const suportaHoverPreciso = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (suportaHoverPreciso && !prefereMenosMovimento) {
    document.querySelectorAll('.botao').forEach((botao) => {
      botao.addEventListener('mousemove', (e) => {
        const retangulo = botao.getBoundingClientRect();
        const x = e.clientX - retangulo.left - retangulo.width / 2;
        const y = e.clientY - retangulo.top - retangulo.height / 2;
        botao.style.transform = `translate(${x * 0.15}px, ${y * 0.3}px)`;
      });
      botao.addEventListener('mouseleave', () => {
        botao.style.transform = '';
      });
    });
  }

  /* ---------------------------------------------------------
     8. Revelar ao rolar (fade + translação ao entrar na tela)
  --------------------------------------------------------- */
  const alvosRevelar = document.querySelectorAll(
    '.grade-sobre, .cartao-servico, #galeria .cabecalho-secao, .formulario-agendamento, .introducao-agendamento, .grade-contato'
  );

  alvosRevelar.forEach((el, i) => {
    el.classList.add('revelar');
    // pequeno atraso escalonado apenas entre os cartões de serviço,
    // para que eles apareçam em sequência, um a um, e não todos de uma vez
    if (el.classList.contains('cartao-servico')) {
      const posicaoNoGrupo = Array.from(el.parentElement.children).indexOf(el);
      el.style.transitionDelay = `${posicaoNoGrupo * 70}ms`;
    }
  });

  const observadorRevelar = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add('revelar--visivel');
        observadorRevelar.unobserve(entrada.target);
      }
    });
  }, { threshold: 0.15 });

  alvosRevelar.forEach((el) => observadorRevelar.observe(el));

  /* ---------------------------------------------------------
     9. Botão flutuante do WhatsApp + link de contato
  --------------------------------------------------------- */
  const mensagemPadrao = "Olá! Vim pelo site e gostaria de agendar uma Tatuagem !!";
  const montarLinkWhatsapp = (numero, mensagem) =>
    `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;

  const whatsappFlutuante = document.getElementById('whatsapp-flutuante');
  whatsappFlutuante.href = montarLinkWhatsapp(NUMERO_WHATSAPP, mensagemPadrao);

  const whatsappContato = document.getElementById('whatsapp-contato');
  if (whatsappContato) {
    whatsappContato.href = montarLinkWhatsapp(NUMERO_WHATSAPP, mensagemPadrao);
    whatsappContato.target = "_blank";
    whatsappContato.rel = "noopener";
  }

  /* ---------------------------------------------------------
     10. Formulário de agendamento inteligente
     Monta a mensagem formatada e abre no WhatsApp
  --------------------------------------------------------- */
  const formularioAgendamento = document.getElementById('formulario-agendamento');

  function formatarDataBR(dataIso) {
    if (!dataIso) return "a combinar";
    const [ano, mes, dia] = dataIso.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  formularioAgendamento.addEventListener('submit', (e) => {
    e.preventDefault();

    const dados = new FormData(formularioAgendamento);
    const nome = (dados.get('nome') || '').trim();
    const telefone = (dados.get('telefone') || '').trim();
    const servico = dados.get('servico') || 'a combinar';
    const tamanho = (dados.get('tamanho') || '').trim();
    const dataDesejada = formatarDataBR(dados.get('data'));
    const referencia = (dados.get('referencia') || '').trim();

    // validação simples de campos obrigatórios
    let valido = true;
    ['nome', 'telefone', 'servico'].forEach((campo) => {
      const el = formularioAgendamento.querySelector(`[name="${campo}"]`);
      if (!el.value) {
        valido = false;
        el.style.boxShadow = '0 0 0 1px #ffffff';
      } else {
        el.style.boxShadow = 'none';
      }
    });

    if (!valido) {
      formularioAgendamento.querySelector('[name="nome"]').focus();
      return;
    }

    const linhas = [
      `Olá! Gostaria de agendar uma tatuagem 🖤`,
      ``,
      `*Nome:* ${nome}`,
      `*Telefone:* ${telefone}`,
      `*Serviço:* ${servico}`,
      tamanho ? `*Tamanho/local:* ${tamanho}` : null,
      `*Data desejada:* ${dataDesejada}`,
      referencia ? `*Referência/ideia:* ${referencia}` : null,
    ].filter(Boolean);

    const mensagem = linhas.join('\n');
    const link = montarLinkWhatsapp(NUMERO_WHATSAPP, mensagem);

    window.open(link, '_blank', 'noopener');
  });

  /* ---------------------------------------------------------
     11. Ano dinâmico no rodapé
  --------------------------------------------------------- */
  const anoAtual = document.getElementById('ano-atual');
  const ano = new Date().getFullYear();
  anoAtual.textContent = ano;
  anoAtual.setAttribute('datetime', String(ano));

});