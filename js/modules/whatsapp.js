/* Fonte única da verdade para o número e a mensagem padrão do WhatsApp.
   O HTML traz apenas "https://wa.me/<numero>" como fallback sem JS;
   este módulo é quem decide a mensagem que acompanha o link. */
export const NUMERO_WHATSAPP = "5522999335284";
export const MENSAGEM_PADRAO = "Olá! Vim pelo site e gostaria de agendar uma Tatuagem !!";

export function montarLinkWhatsapp(numero, mensagem) {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}

export function iniciarLinksWhatsapp() {
  const whatsappFlutuante = document.getElementById('whatsapp-flutuante');
  whatsappFlutuante.href = montarLinkWhatsapp(NUMERO_WHATSAPP, MENSAGEM_PADRAO);

  const whatsappContato = document.getElementById('whatsapp-contato');
  if (whatsappContato) {
    whatsappContato.href = montarLinkWhatsapp(NUMERO_WHATSAPP, MENSAGEM_PADRAO);
  }
}
