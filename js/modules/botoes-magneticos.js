/* Botões magnéticos — só em telas com mouse de precisão.
   O botão se desloca sutilmente em direção ao cursor, e volta ao lugar
   quando o mouse sai. */
export function iniciarBotoesMagneticos() {
  const prefereMenosMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const suportaHoverPreciso = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (!suportaHoverPreciso || prefereMenosMovimento) return;

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
