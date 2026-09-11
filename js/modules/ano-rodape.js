/* Ano dinâmico no rodapé. */
export function iniciarAnoRodape() {
  const anoAtual = document.getElementById('ano-atual');
  const ano = new Date().getFullYear();
  anoAtual.textContent = ano;
  anoAtual.setAttribute('datetime', String(ano));
}
