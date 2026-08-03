/* ==========================================================
   ALINE SANTOS TATTOO — script.js
   Menu mobile, cabeçalho ao rolar, barra de progresso, parallax,
   scrollspy do menu, carrossel, contadores animados, botões
   magnéticos, revelar ao rolar, modal de zoom da galeria e
   integração inteligente com WhatsApp.
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
    clearInterval(autoplay); // evita o autoplay "puxar" o carrossel no meio do arraste
  });

  trilha.addEventListener('pointerup', (e) => {
    if (!arrastando) return;
    arrastando = false;
    const diferenca = posicaoInicial - e.clientX;

    if (Math.abs(diferenca) > 40) {
      // arraste real -> navega o carrossel
      diferenca > 0 ? irParaItem(indiceAtual + 1) : irParaItem(indiceAtual - 1);
    } else {
      // não foi arraste, foi um toque/clique -> abre o zoom da foto tocada.
      // Necessário porque o setPointerCapture acima redireciona o clique
      // para o próprio "trilha", então a <img> nunca recebe o evento direto.
      const elementoTocado = document.elementFromPoint(e.clientX, e.clientY);
      const imgTocada = elementoTocado?.closest('.quadro-tatuagem')?.querySelector('img');
      if (imgTocada) abrirModalZoom(imgTocada);
    }
  });

  trilha.addEventListener('pointercancel', () => { arrastando = false; });

  atualizarCarrossel();

  // Autoplay suave do carrossel (reinicia ao interagir)
  let autoplay = setInterval(() => irParaItem(indiceAtual + 1), 5000);
  const reiniciarAutoplay = () => {
    clearInterval(autoplay);
    // se o modal de zoom estiver aberto, não reinicia — evita que o "click"
    // disparado logo após o toque que abriu o modal reative o autoplay
    // por trás dele (o navegador emite pointerup e depois click no mesmo toque)
    if (modalZoom.classList.contains('modal-zoom--aberto')) return;
    autoplay = setInterval(() => irParaItem(indiceAtual + 1), 5000);
  };
  [botaoAnterior, botaoProximo, trilha].forEach(el => el.addEventListener('click', reiniciarAutoplay));

  /* ---------------------------------------------------------
     6. Modal de zoom — abre a imagem da galeria em tela cheia,
     com navegação por setas, teclado e swipe (arrastar o dedo)
  --------------------------------------------------------- */
  const modalZoom = document.createElement('div');
  modalZoom.className = 'modal-zoom';
  modalZoom.setAttribute('role', 'dialog');
  modalZoom.setAttribute('aria-modal', 'true');
  modalZoom.setAttribute('aria-label', 'Imagem ampliada');
  modalZoom.innerHTML = `
    <button type="button" class="modal-zoom-nav modal-zoom-anterior" aria-label="Foto anterior">&#8592;</button>
    <img src="" alt="">
    <button type="button" class="modal-zoom-nav modal-zoom-proximo" aria-label="Próxima foto">&#8594;</button>
    <button type="button" class="modal-zoom-fechar" aria-label="Fechar imagem ampliada">&times;</button>
  `;
  document.body.appendChild(modalZoom);

  const imagemModalZoom = modalZoom.querySelector('img');
  const botaoFecharZoom = modalZoom.querySelector('.modal-zoom-fechar');
  const botaoZoomAnterior = modalZoom.querySelector('.modal-zoom-anterior');
  const botaoZoomProximo = modalZoom.querySelector('.modal-zoom-proximo');

  // reaproveita o array "itens" (li's) já usado pelo carrossel na seção 5,
  // pegando a <img> de dentro de cada um
  const imagensGaleria = itens.map((item) => item.querySelector('img'));
  let indiceModalZoom = 0;

  function mostrarImagemModalZoom(indice) {
    indiceModalZoom = (indice + imagensGaleria.length) % imagensGaleria.length;
    const img = imagensGaleria[indiceModalZoom];
    imagemModalZoom.src = img.src;
    imagemModalZoom.alt = img.alt || '';
  }

  // guarda o elemento que estava focado antes de abrir o modal, para devolver
  // o foco a ele quando o modal for fechado (evita "perder" o teclado)
  let elementoFocadoAntesDoModal = null;

  function abrirModalZoom(imgOrigem) {
    const indice = imagensGaleria.indexOf(imgOrigem);
    mostrarImagemModalZoom(indice === -1 ? 0 : indice);
    elementoFocadoAntesDoModal = document.activeElement;
    modalZoom.classList.add('modal-zoom--aberto');
    document.body.style.overflow = 'hidden';
    clearInterval(autoplay); // evita o carrossel avançar sozinho por trás do modal
    botaoFecharZoom.focus();
  }

  function fecharModalZoom() {
    modalZoom.classList.remove('modal-zoom--aberto');
    document.body.style.overflow = '';
    reiniciarAutoplay(); // retoma o autoplay de onde o carrossel parou
    if (elementoFocadoAntesDoModal) elementoFocadoAntesDoModal.focus();
  }

  botaoFecharZoom.addEventListener('click', fecharModalZoom);
  botaoZoomAnterior.addEventListener('click', () => mostrarImagemModalZoom(indiceModalZoom - 1));
  botaoZoomProximo.addEventListener('click', () => mostrarImagemModalZoom(indiceModalZoom + 1));

  modalZoom.addEventListener('click', (e) => {
    if (e.target === modalZoom) fecharModalZoom();
  });

  document.addEventListener('keydown', (e) => {
    if (!modalZoom.classList.contains('modal-zoom--aberto')) return;
    if (e.key === 'Escape') fecharModalZoom();
    if (e.key === 'ArrowRight') mostrarImagemModalZoom(indiceModalZoom + 1);
    if (e.key === 'ArrowLeft') mostrarImagemModalZoom(indiceModalZoom - 1);

    // prende o Tab dentro do modal — sem isso, dar Tab/Shift+Tab deixa o
    // foco do teclado "escapar" para links/botões da página escondidos
    // atrás do overlay escuro, que o usuário não consegue ver
    if (e.key === 'Tab') {
      const botoesFocaveis = [botaoZoomAnterior, botaoZoomProximo, botaoFecharZoom]
        .filter((el) => el.offsetParent !== null); // ignora os que não estão visíveis
      const primeiro = botoesFocaveis[0];
      const ultimo = botoesFocaveis[botoesFocaveis.length - 1];

      if (e.shiftKey && document.activeElement === primeiro) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primeiro.focus();
      }
    }
  });

  // Swipe (arrastar o dedo) para trocar de foto no modal — mesma lógica
  // de Pointer Events usada no carrossel, cobrindo touch, mouse e caneta
  let posicaoInicialModalZoom = 0;
  let arrastandoModalZoom = false;

  imagemModalZoom.addEventListener('pointerdown', (e) => {
    posicaoInicialModalZoom = e.clientX;
    arrastandoModalZoom = true;
    imagemModalZoom.setPointerCapture(e.pointerId);
  });

  imagemModalZoom.addEventListener('pointerup', (e) => {
    if (!arrastandoModalZoom) return;
    arrastandoModalZoom = false;
    const diferenca = posicaoInicialModalZoom - e.clientX;
    if (Math.abs(diferenca) > 40) {
      diferenca > 0
        ? mostrarImagemModalZoom(indiceModalZoom + 1)
        : mostrarImagemModalZoom(indiceModalZoom - 1);
    }
  });

  imagemModalZoom.addEventListener('pointercancel', () => {
    arrastandoModalZoom = false;
  });

  /* ---------------------------------------------------------
     7. Contadores animados (seção Sobre)
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
     8. Botões magnéticos — só em telas com mouse de precisão.
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
     9. Revelar ao rolar (fade + translação ao entrar na tela)
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
     10. Botão flutuante do WhatsApp + link de contato
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
     11. Formulário de agendamento inteligente
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
     12. Ano dinâmico no rodapé
  --------------------------------------------------------- */
  const anoAtual = document.getElementById('ano-atual');
  const ano = new Date().getFullYear();
  anoAtual.textContent = ano;
  anoAtual.setAttribute('datetime', String(ano));

});