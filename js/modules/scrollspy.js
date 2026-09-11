/* Scrollspy — destaca no menu o link da seção visível. */
export function iniciarScrollspy() {
  const secoesComId = document.querySelectorAll('main section[id]');
  const linksMenu = Array.from(document.querySelectorAll('.link-menu'));

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
}
