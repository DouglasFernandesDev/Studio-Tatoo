/* Menu mobile (hambúrguer). */
export function iniciarMenuMobile() {
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
  linksMenu.forEach((link) => link.addEventListener('click', fecharMenu));
}
