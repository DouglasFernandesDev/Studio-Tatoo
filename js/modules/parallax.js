/* Parallax suave nas imagens de fundo.
   Desloca cada imagem [data-paralaxe] com base em quão perto seu
   contêiner está do centro da tela. Só roda se o usuário não pediu
   "menos movimento" no sistema operacional. */
export function iniciarParalaxe() {
  const prefereMenosMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const imagensParalaxe = Array.from(document.querySelectorAll('[data-paralaxe]'));

  if (!imagensParalaxe.length || prefereMenosMovimento) return;

  function aplicarParalaxe() {
    const alturaJanela = window.innerHeight;
    imagensParalaxe.forEach((img) => {
      const container = img.closest('section') || img.parentElement;
      const retangulo = container.getBoundingClientRect();
      const centroContainer = retangulo.top + retangulo.height / 2;
      const distanciaDoCentro = centroContainer - alturaJanela / 2;
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

  aplicarParalaxe();
  window.addEventListener('scroll', aoRolarParalaxe, { passive: true });
  window.addEventListener('resize', aoRolarParalaxe, { passive: true });
}
