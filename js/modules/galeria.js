/* Carrossel da galeria + modal de zoom.
   Os dois ficam no mesmo módulo porque compartilham estado (o autoplay
   do carrossel precisa pausar quando o modal abre, e o modal reaproveita
   a lista de imagens do carrossel). */
export function iniciarGaleria() {
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
  [botaoAnterior, botaoProximo, trilha].forEach((el) => el.addEventListener('click', reiniciarAutoplay));

  /* Modal de zoom — abre a imagem da galeria em tela cheia, com navegação
     por setas, teclado e swipe (arrastar o dedo). */
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

  // reaproveita o array "itens" (li's) já usado pelo carrossel acima,
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
}
