# Rotina da Ana

Aplicação pessoal de organização da rotina: **tarefas, compromissos, calendário, treinos, alimentação, hábitos e relatórios**.
Funciona no computador, sem login, sem servidor contratado e sem internet: todos os dados ficam salvos **somente no navegador** de quem usa.

---

## 1. Como abrir no computador

**Jeito mais fácil (recomendado):** dê dois cliques em **`Abrir Rotina da Ana.bat`**.
Ele liga um pequeno servidor local (só para este computador, não acessível pela internet) e abre o navegador em
**http://localhost:8787**.

> Use sempre o mesmo endereço (`http://localhost:8787`) e o mesmo navegador: os dados ficam guardados por endereço e por navegador.

No primeiro acesso aparece a tela **“Bem-vinda à Rotina da Ana”**. Clique em **Carregar meus dados** para importar o plano
alimentar, os treinos e os compromissos (arquivo `dados-iniciais/rotina-da-ana-dados-iniciais.json`).

**Alternativa sem servidor:** abrir `index.html` direto (duplo clique) também funciona, mas nesse modo o navegador não permite
instalar como aplicativo nem o modo offline completo. Na tela de boas-vindas, use **Escolher arquivo** e selecione o arquivo de dados iniciais.

## 2. Como instalar como aplicativo

1. Abra pelo `Abrir Rotina da Ana.bat` (ou pelo endereço do GitHub Pages) no **Chrome** ou **Edge**.
2. Clique no ícone de instalação na barra de endereço (um monitor com seta) **ou** no botão **Instalar aplicativo** da barra lateral.
3. Pronto: a Rotina da Ana ganha um ícone próprio na área de trabalho/menu Iniciar e abre em janela própria.

Depois de instalada, ela abre e funciona **mesmo sem internet** (os arquivos ficam guardados pelo *service worker*).
No celular: abra o endereço do GitHub Pages e use “Adicionar à tela inicial”.

## 3. Backup (muito importante)

Os dados ficam só no navegador. Se o navegador for limpo/reinstalado, eles se perdem — por isso:

- **Configurações → Backup e dados → Exportar backup** gera um arquivo `rotina-da-ana_backup_AAAA-MM-DD.json`.
- Faça isso **uma vez por semana** e guarde o arquivo no Google Drive, OneDrive ou pen drive.

## 4. Como restaurar os dados

- **Configurações → Importar backup** e escolha o arquivo `.json` do backup. Todos os dados atuais são substituídos (há confirmação antes).
- **Restaurar dados iniciais** recarrega o plano alimentar, os treinos e os compromissos originais, **sem apagar** tarefas e históricos.
- **Apagar todos os dados** limpa tudo (pede para digitar `APAGAR`).

Para usar em outro computador/navegador: exporte o backup em um e importe no outro.

## 5. Como atualizar a aplicação

1. Substitua os arquivos da pasta (menos a pasta `dados-iniciais`, se quiser preservá-la).
2. Em `sw.js`, aumente o número da versão: `const CACHE = 'rotina-da-ana-v2';`
3. Abra o app e recarregue a página (Ctrl+F5). Os dados **não** são afetados por atualizações, pois ficam no navegador, não nos arquivos.

## 6. Publicar no GitHub Pages (opcional)

O app é 100% estático, então funciona no GitHub Pages. **Os dados pessoais nunca vão para o repositório**:

- O arquivo `.gitignore` já exclui a pasta `dados-iniciais/` (dieta, treinos e compromissos) e arquivos de backup/relatório.
- Tudo o que a Ana registra fica no `localStorage` do navegador dela — nada é enviado a nenhum servidor.

Passo a passo:

1. Crie um repositório no GitHub (pode ser privado se tiver plano que permita Pages privado; se for público, só o **código** fica visível).
2. Envie os arquivos desta pasta **sem** a pasta `dados-iniciais` (o `.gitignore` cuida disso se usar `git`; se enviar pelo site, não arraste essa pasta).
3. No repositório: **Settings → Pages → Build and deployment → Deploy from a branch**, escolha `main` e a pasta `/ (root)`.
4. Em alguns minutos o endereço fica disponível (ex.: `https://SEU-USUARIO.github.io/rotina-da-ana/`).
5. No primeiro acesso, clique em **Escolher arquivo** e selecione o `rotina-da-ana-dados-iniciais.json` que ficou no computador.

> Atenção: `localhost:8787` e o endereço do GitHub Pages são “lugares” diferentes para o navegador — cada um tem seus próprios dados.
> Escolha um como principal e use o backup para levar os dados de um para o outro.

## 7. O que tem em cada aba

| Aba | Recursos |
|---|---|
| **Início** | Saudação, frase do dia, 6 indicadores, linha do tempo do dia (editável), próximos compromissos, hábitos e gráficos da semana |
| **Calendário** | Mês, semana e dia; filtros por categoria; clique no dia para ver e criar itens; treinos e tarefas aparecem automaticamente |
| **Tarefas** | Lista, quadro (kanban com arrastar e soltar) e calendário; prioridades, categorias, filtros e progresso do dia/semana |
| **Compromissos** | Hoje, próximos 7 dias, mais adiante e passados; lembretes; marcar como realizado |
| **Treinos** | Semana visual, biblioteca de treinos, concluir com duração/avaliação/observações, histórico e gráficos |
| **Alimentação** | Refeições do plano com todas as opções, marcar alimentos/porções consumidas, água, calorias e macros, gráficos, histórico, substituições, saladas e receitas |
| **Relatórios** | 7 dias, 30 dias, mês atual ou período personalizado; exportação CSV e JSON |
| **Configurações** | Nome, avatar/foto, tema claro/escuro, metas, horários, categorias, hábitos, backup |

## 8. Sobre os dados importados dos arquivos

- **Treinos:** exercícios, séries, repetições e descanso exatamente como no PDF. O plano não diz **quais dias da semana**
  nem **cargas** — a Ana escolhe os dias na aba Treinos e preenche as cargas editando cada treino.
- **Alimentação:** alimentos, quantidades, horários e opções exatamente como no plano. Quando o plano não traz valores
  nutricionais por alimento, eles aparecem como **“não informado”**.
  O botão **“Preencher com estimativas TACO”** calcula valores aproximados (Tabela Brasileira de Composição de Alimentos e médias de rótulos),
  que ficam marcados como **estimado** e podem ser removidos a qualquer momento. As gramas usadas nessas estimativas para medidas caseiras
  (fatia, colher, concha) são aproximações e podem ser corrigidas no editor de cada refeição.
- **Compromissos:** vieram das capturas do calendário do celular. Títulos que apareciam cortados
  foram importados assim, com uma observação pedindo para completar.

## 9. Estrutura do projeto

```
index.html               página principal
manifest.webmanifest     dados do aplicativo instalável (PWA)
sw.js                    service worker (modo offline)
css/app.css              identidade visual (tema claro e escuro, responsivo)
js/core.js               utilidades, datas, ícones, janelas e avisos
js/store.js              armazenamento local, cálculos e tabela de referência nutricional
js/charts.js             gráficos em SVG (sem bibliotecas externas)
js/art.js                ilustrações em SVG (alimentos, treinos, avatares)
js/editors.js            formulários de compromissos, tarefas, treinos e rotina
js/app.js                navegação, topo, lembretes e instalação
js/views/*.js            uma tela por aba
icons/                   ícones do aplicativo
servidor.ps1             servidor local (somente localhost)
Abrir Rotina da Ana.bat  atalho para abrir
dados-iniciais/          ⚠ dados pessoais — não publicar (ignorado pelo git)
```

Não há etapa de compilação nem dependências para instalar: basta editar os arquivos e recarregar a página.
