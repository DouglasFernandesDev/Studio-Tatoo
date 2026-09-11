/* Revelar ao rolar (fade + translação ao entrar na tela). */
export function iniciarRevelarAoRolar() {
  const alvosRevelar = document.querySelectorAll(
    '.grade-sobre, .cartao-servico, #galeria .cabecalho-secao, .formulario-agendamento, .introducao-agendamento, .grade-contato'
  );

  alvosRevelar.forEach((el) => {
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
}
