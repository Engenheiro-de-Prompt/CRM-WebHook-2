# IntelliTask CRM - Gerenciador de Tarefas com Integração Google Sheets

Este é um software de gestão de tarefas projetado para fornecer uma interface clara e organizada para dados de tarefas armazenados em uma Google Sheet. A aplicação busca os dados da sua planilha, os categoriza automaticamente e os exibe em um dashboard limpo e funcional.

## Funcionalidades

- **Backend com API Segura**: Um servidor Flask em Python que se conecta de forma segura à API do Google Sheets.
- **Dashboard de Tarefas Priorizadas**: Uma interface de usuário construída com React e TypeScript que exibe:
  - Tarefas para fazer hoje (ordenadas por prioridade)
  - Tarefas atrasadas
  - Próximas tarefas (para os próximos 7 dias)
- **Configuração Flexível**: A aplicação é configurada via variáveis de ambiente para fácil personalização do ID e do intervalo da sua planilha.
- **Interface Reativa**: Feedback visual para estados de carregamento e erro durante a busca de dados.

## Pré-requisitos

Antes de começar, garanta que você tenha os seguintes softwares instalados:
- [Node.js](https://nodejs.org/) (que inclui npm)
- [Python](https://www.python.org/) (versão 3.8 ou superior)
- `pip` (gerenciador de pacotes do Python)

---

## Guia de Instalação e Configuração

Siga estes passos para configurar e rodar a aplicação localmente.

### 1. Configuração do Backend

O backend é responsável por se conectar à sua Google Sheet e fornecer os dados para a interface.

**a. Navegue até a pasta do backend:**
```bash
cd backend
```

**b. Crie o arquivo de ambiente:**
Crie um arquivo chamado `.env` dentro da pasta `backend`. Você pode copiar o exemplo abaixo e preenchê-lo com seus dados.
```env
# .env

# O ID da sua Google Sheet. Você pode encontrá-lo na URL da planilha.
# Ex: https://docs.google.com/spreadsheets/d/ESTE_E_O_ID/edit
GOOGLE_SHEET_ID="SEU_ID_DA_PLANILHA_AQUI"

# O nome da aba e o intervalo de dados que você quer ler.
# Ex: 'Página1!A:G' para ler as colunas de A a G da aba "Página1".
GOOGLE_SHEET_RANGE="SEU_INTERVALO_DE_DADOS_AQUI"
```

**c. Configure as Credenciais da API do Google:**
Esta é a etapa mais importante.
1. Acesse o [Google Cloud Console](https://console.cloud.google.com/).
2. Crie um novo projeto (ou selecione um existente).
3. No menu de navegação, vá para **APIs e Serviços > Biblioteca**.
4. Procure por **"Google Sheets API"** e ative-a.
5. Volte para **APIs e Serviços > Credenciais**.
6. Clique em **Criar Credenciais > ID do cliente OAuth**.
7. Selecione **"Aplicativo para computador"** como o tipo de aplicativo.
8. Após a criação, clique no ícone de download (JSON) para baixar suas credenciais.
9. Renomeie o arquivo baixado para `credentials.json` e **mova-o para a pasta `backend`**.

**d. Instale as dependências do Python:**
```bash
pip install -r requirements.txt
```

**e. Autorize a Aplicação (Primeira Execução):**
Execute o servidor uma vez pelo terminal para completar o fluxo de autorização do Google.
```bash
python app.py
```
- Uma janela do seu navegador será aberta, pedindo para você fazer login com sua Conta Google e autorizar o acesso.
- Após a autorização, um arquivo `token.json` será criado na pasta `backend`. Isso só precisa ser feito uma vez.
- Você pode fechar o servidor (Ctrl+C) após ver a mensagem de sucesso da autorização.

**f. Rode o Servidor Backend:**
Agora você pode iniciar o servidor normalmente.
```bash
python app.py
```
O backend estará rodando em `http://localhost:5001`.

### 2. Configuração do Frontend

O frontend é a interface de usuário que você verá no navegador.

**a. Navegue de volta para a pasta raiz do projeto:**
```bash
# Se você está na pasta 'backend'
cd ..
```

**b. Instale as dependências do Node.js:**
```bash
npm install
```

**c. Rode o Servidor de Desenvolvimento do Frontend:**
```bash
npm run dev
```
A aplicação frontend estará disponível em `http://localhost:5173` (ou em outra porta, se a 5173 estiver ocupada).

### 3. Utilizando a Aplicação

1. Com ambos os servidores (backend e frontend) rodando, abra seu navegador e acesse o endereço do frontend (ex: `http://localhost:5173`).
2. A aplicação pedirá uma configuração inicial. Você pode inserir qualquer URL (ex: `http://example.com`) para habilitar a visualização do dashboard. Esta etapa é um resquício da funcionalidade anterior e pode ser removida no futuro.
3. O dashboard buscará os dados do seu backend e exibirá as tabelas de tarefas.

**Importante:** Para que o dashboard funcione, sua Google Sheet **deve conter** colunas com os seguintes cabeçalhos (em minúsculas): `due date`, `status`, e `priority`.
