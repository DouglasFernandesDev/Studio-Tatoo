import { iniciarCabecalhoScroll } from './modules/cabecalho-scroll.js';
import { iniciarMenuMobile } from './modules/menu-mobile.js';
import { iniciarScrollspy } from './modules/scrollspy.js';
import { iniciarParalaxe } from './modules/parallax.js';
import { iniciarGaleria } from './modules/galeria.js';
import { iniciarContadores } from './modules/contadores.js';
import { iniciarBotoesMagneticos } from './modules/botoes-magneticos.js';
import { iniciarRevelarAoRolar } from './modules/revelar-scroll.js';
import { iniciarLinksWhatsapp } from './modules/whatsapp.js';
import { iniciarFormularioAgendamento } from './modules/formulario-agendamento.js';
import { iniciarAnoRodape } from './modules/ano-rodape.js';

document.addEventListener('DOMContentLoaded', () => {
  iniciarCabecalhoScroll();
  iniciarMenuMobile();
  iniciarScrollspy();
  iniciarParalaxe();
  iniciarGaleria();
  iniciarContadores();
  iniciarBotoesMagneticos();
  iniciarRevelarAoRolar();
  iniciarLinksWhatsapp();
  iniciarFormularioAgendamento();
  iniciarAnoRodape();
});
