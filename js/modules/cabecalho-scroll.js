/* Cabeçalho ao rolar + barra de progresso.
   Uma única leitura de scroll por frame (requestAnimationFrame) evita
   disparar cálculos repetidos e mantém a rolagem suave. */
export function iniciarCabecalhoScroll() {
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
}
