/* Formulário de agendamento inteligente.
   Monta a mensagem formatada e abre no WhatsApp. */
import { NUMERO_WHATSAPP, montarLinkWhatsapp } from './whatsapp.js';

export function iniciarFormularioAgendamento() {
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

    // validação simples de campos obrigatórios, sinalizada via classe +
    // aria-invalid para que leitores de tela também percebam o erro
    let valido = true;
    ['nome', 'telefone', 'servico'].forEach((campo) => {
      const el = formularioAgendamento.querySelector(`[name="${campo}"]`);
      const campoInvalido = !el.value;
      if (campoInvalido) valido = false;
      el.classList.toggle('campo--invalido', campoInvalido);
      el.setAttribute('aria-invalid', String(campoInvalido));
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

    const novaJanela = window.open(link, '_blank', 'noopener');
    // se o navegador bloquear o pop-up, navega na mesma aba em vez de
    // deixar o usuário sem nenhum retorno ao clicar em enviar
    if (!novaJanela) window.location.href = link;
  });
}
