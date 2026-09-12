# Studio-Tatoo
Studio-Tatoo
# Aline Santos Tattoo — Site Institucional

Site one-page para estúdio de tatuagem, construído do zero com HTML, CSS e JavaScript puros — sem frameworks, sem build step, sem dependências externas além das fontes do Google Fonts. A ideia por trás dessa escolha foi simplicidade de manutenção: qualquer pessoa com conhecimento básico de front-end consegue abrir o código e entender o que está acontecendo, sem precisar rodar `npm install` ou aprender a estrutura de um framework.

🔗 **Live:** _https://alinesantostattoo.netlify.app/_

---

## Stack

| Camada | Tecnologia | Por quê |
|---|---|---|
| Markup | HTML5 semântico | Acessibilidade e SEO sem esforço extra |
| Estilo | CSS3 (custom properties, Grid, Flexbox, `:has()`) | Zero dependência de framework CSS, controle total sobre o design |
| Comportamento | JavaScript vanilla (ES6+) | Site leve o suficiente pra não justificar React/Vue numa página só |
| Tipografia | Google Fonts (Fraunces + Inter) | Fraunces pro tom editorial/autoral do estúdio, Inter pra legibilidade em corpo de texto |
| Deploy | Netlify | Deploy contínuo, HTTPS automático, zero configuração de servidor |

Não tem `package.json`, não tem bundler, não tem etapa de build. O que está no repositório é exatamente o que vai pro ar.

---

## Estrutura de arquivos

```
├── index.html          → toda a estrutura e conteúdo do site
├── css/
│   ├── style.css        → estilos base, componentes, modal de zoom
│   └── responsive.css    → breakpoints (640px e 1024px)
├── js/
│   ├── main.js           → ponto de entrada (`<script type="module">`), só orquestra os módulos
│   └── modules/          → um módulo ES por responsabilidade, cada um expondo uma função `iniciar...()`
│       ├── cabecalho-scroll.js       → cabeçalho ao rolar + barra de progresso
│       ├── menu-mobile.js            → menu hambúrguer
│       ├── scrollspy.js              → destaque do link ativo no menu
│       ├── parallax.js               → parallax das imagens de fundo
│       ├── galeria.js                → carrossel + modal de zoom
│       ├── contadores.js             → contadores animados da seção Sobre
│       ├── botoes-magneticos.js      → efeito magnético dos botões (só com mouse de precisão)
│       ├── revelar-scroll.js         → fade/translação ao entrar na tela
│       ├── whatsapp.js               → fonte única do número/mensagem do WhatsApp
│       ├── formulario-agendamento.js → validação + montagem da mensagem do formulário
│       └── ano-rodape.js             → ano dinâmico no rodapé
└── imagens/              → fotos do portfólio, logo, favicon
```

O JS é organizado em módulos ES (`import`/`export`), carregados via `<script type="module" src="js/main.js">`. Cada módulo cuida de uma única responsabilidade e não depende da ordem de execução dos outros — `main.js` só importa e chama cada `iniciar...()` dentro de um `DOMContentLoaded`. Isso substitui a versão anterior (um único `script.js` com 12 seções numeradas): o comportamento é o mesmo, mas cada bloco agora é um arquivo isolado, mais fácil de localizar, testar e reaproveitar sem escopo global compartilhado.

---

## Decisões de design e engenharia

### Por que sem framework?
Um site institucional de página única, com conteúdo estático (o cliente não vai adicionar produtos, criar posts, gerenciar pedidos), não justifica o overhead de um framework JS. Vanilla JS aqui significa: sem tempo de build, sem versões de dependência pra atualizar, sem bundle pra quebrar daqui a dois anos. O trade-off consciente é que qualquer funcionalidade nova exige mais código manual — pra esse escopo, é a troca certa.

### Carrossel com Pointer Events
O carrossel de portfólio usa a API de **Pointer Events** (`pointerdown`/`pointerup`/`pointercancel`) em vez de escutar `touchstart`/`mousedown` separadamente. Isso unifica mouse, toque e caneta numa única implementação, com `setPointerCapture` garantindo que o arraste não "trave" se o usuário soltar o dedo fora do elemento original.

### Modal de zoom com foco acessível
A galeria abre as fotos em tela cheia via um modal injetado dinamicamente pelo JS (não existe no HTML estático — é criado em runtime e anexado ao `<body>`). Ele:
- Move o foco do teclado pro botão de fechar ao abrir, e devolve o foco pra onde estava antes ao fechar;
- Prende o `Tab`/`Shift+Tab` dentro dos controles do modal enquanto ele está aberto, pra ninguém navegando só com teclado "escapar" pra elementos escondidos atrás do overlay;
- Suporta seta do teclado, clique nos botões e swipe (arrastar o dedo) pra navegar entre as fotos;
- Pausa o autoplay do carrossel enquanto está aberto, e retoma de onde parou ao fechar.

### Performance sem cortar canto
- `IntersectionObserver` em vez de listeners de `scroll` para animações de entrada e para o scrollspy do menu — evita recalcular layout a cada pixel rolado.
- Leituras de `scroll`/`resize` sempre agrupadas num único `requestAnimationFrame` por frame, pra não disparar múltiplos reflows.
- Imagens da galeria com `loading="lazy"`, exceto a hero (`loading="eager"`, já que ela aparece imediatamente).
- `prefers-reduced-motion` respeitado: parallax, contadores animados e botões magnéticos são desativados automaticamente pra quem configurou o sistema pra reduzir movimento.

### Formulário → WhatsApp, sem back-end
O formulário de agendamento não envia dados pra nenhum servidor — ele monta a mensagem formatada em JavaScript e abre o WhatsApp Web/App já com o texto preenchido (`wa.me/...?text=...`). Zero back-end, zero banco de dados, zero custo de manutenção de servidor. Para o volume de um estúdio pequeno, é a solução mais simples que resolve o problema real (fazer o cliente entrar em contato) sem complexidade desnecessária.

### Resiliência a falha de JavaScript
Os links de WhatsApp (botão flutuante e seção de contato) já vêm com uma URL completa e funcional direto no HTML. O JavaScript reforça esse valor por cima, mas se o script falhar ao carregar por qualquer motivo (erro de rede, bloqueador de conteúdo mais agressivo), o botão continua funcionando.

---

## Acessibilidade

- Hierarquia de headings coerente (`h1` único na hero, `h2` por seção).
- `alt` descritivo em imagens de conteúdo relevante; nas fotos do carrossel o `alt` fica vazio porque a legenda visível (`<figcaption>`) já descreve a categoria — evita repetir a mesma descrição dezenas de vezes pra quem usa leitor de tela.
- Link "pular para o conteúdo" no topo da página, pra quem navega com teclado.
- Estados de foco visíveis (`:focus-visible`) em vez de removidos globalmente.
- Modal com `role="dialog"`, `aria-modal="true"` e gerenciamento de foco (detalhado acima).
- Validação do formulário de agendamento sinalizada via `aria-invalid` + classe CSS, não só por cor — leitor de tela também percebe o campo com erro.
- Respeito a `prefers-reduced-motion` em todas as animações.

---

## Responsividade

Duas quebras de layout, mobile-first:

- **até 639px**: menu hambúrguer, formulário em coluna única, carrossel mostrando 1 foto por vez.
- **640px+**: formulário em 2 colunas, carrossel mostrando ~60% de cada foto.
- **1024px+**: menu horizontal fixo no header, grid de "Sobre" e "Agendar" em duas colunas, carrossel mostrando ~38% por foto.

---

## Deploy

O projeto está hospedado na **Netlify**, com deploy contínuo — qualquer alteração enviada ao repositório conectado sobe automaticamente, sem passos manuais.

Para apontar um domínio próprio (ex: `alinesantostattoo.com.br`) no lugar do subdomínio gratuito `*.netlify.app`, basta comprar o domínio num registrador e configurar os registros DNS apontando pra Netlify — a hospedagem continua sendo a mesma, só muda o endereço.

---

## O que eu mudaria numa v2

Ficam registradas aqui as próximas melhorias naturais, caso o projeto cresça:

- **CMS leve** (ex: Netlify CMS ou similar) pra o cliente conseguir trocar fotos da galeria e textos sem depender de um dev pra cada alteração pequena.
- **Otimização de imagens automatizada** (compressão + `srcset` para diferentes densidades de tela) — hoje as imagens são servidas no tamanho original.
- **Testes E2E com Playwright** cobrindo os fluxos mais sensíveis (formulário → WhatsApp, carrossel, modal de zoom) — ainda não configurado neste projeto.
- **Analytics leve** (Plausible ou Fathom) pra o cliente entender de onde vêm os visitantes, sem comprometer privacidade com Google Analytics.

---

## Créditos

Desenvolvido sob medida para o estúdio **Aline Santos Tattoo**. Fontes via Google Fonts (Fraunces, Inter). Ícones em SVG inline, desenhados/adaptados especificamente para este projeto — sem dependência de biblioteca de ícones externa.