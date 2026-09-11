/* Contadores animados (seção Sobre).
   Anima de 0 até o valor real quando a estatística entra na tela. O HTML
   já traz o valor final como texto — isso é só um reforço visual
   progressivo; sem JavaScript, o número correto continua ali. */
export function iniciarContadores() {
  const prefereMenosMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
}
