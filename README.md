# Email Verification Tool

Uma ferramenta moderna e segura para verificação de emails desenvolvida pela Townsend Solutions.

![Email Verification Tool](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## 🚀 Recursos

### Verificação Individual
- ✅ Verificação em tempo real de endereços de email
- 🔍 Validação de formato, DNS e SMTP
- 🚨 Detecção de emails descartáveis (disposable)
- 📊 Relatório detalhado com status e informações técnicas
- ⚡ Interface responsiva e intuitiva

### Verificação em Lote (Bulk Check)
- 📁 Suporte para arquivos CSV e Excel (.xlsx)
- 🎯 Processamento em lotes de até 10.000 emails
- 📈 Barra de progresso em tempo real
- 🔄 Processamento por lotes (50 emails por vez)
- 📊 Dashboard com estatísticas detalhadas
- 🎨 Filtros interativos por status (válido, inválido, arriscado)
- 💾 Exportação de resultados em CSV
- 🖱️ Drag & Drop para upload de arquivos
- ⬆️ Botão "Back to top" para navegação em listas longas

### Segurança e Privacidade
- 🔒 **Nenhum dado é armazenado** - 100% GDPR compliant
- 🗑️ Todos os dados são processados em memória e descartados após a verificação
- 🛡️ Badge de privacidade visível na interface
- ✨ Zero retenção de dados pessoais

## 🛠️ Tecnologias

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19.2, Tailwind CSS v4
- **Componentes**: shadcn/ui
- **Validação**: DNS lookup, SMTP verification
- **Processamento**: xlsx para arquivos Excel
- **TypeScript**: Tipagem completa end-to-end

## 📋 Pré-requisitos

- Node.js 18+ 
- npm, yarn ou pnpm

## 🔧 Instalação

1. Clone o repositório:
\`\`\`bash
git clone https://github.com/seu-usuario/email-verification-tool.git
cd email-verification-tool
\`\`\`

2. Instale as dependências:
\`\`\`bash
npm install
# ou
yarn install
# ou
pnpm install
\`\`\`

3. Execute o servidor de desenvolvimento:
\`\`\`bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
\`\`\`

4. Abra [http://localhost:3000](http://localhost:3000) no navegador

## 📖 Como Usar

### Verificação Individual

1. Acesse a aba **"Single Check"**
2. Digite o endereço de email que deseja verificar
3. Clique em **"Verify Email"**
4. Visualize o resultado com detalhes técnicos:
   - ✅ Valid: Email válido e funcional
   - ❌ Invalid: Email inválido ou inexistente
   - ⚠️ Risky: Email arriscado (descartável ou suspeito)
   - 🔴 Error: Erro durante verificação

### Verificação em Lote

1. Acesse a aba **"Bulk Check"**
2. Prepare seu arquivo:
   - Formato CSV com coluna "Email"
   - Formato Excel (.xlsx) com coluna "Email"
   - Máximo de 10.000 emails
3. Faça upload:
   - Arraste e solte o arquivo na área indicada
   - Ou clique para selecionar o arquivo
4. Aguarde o processamento (progresso em tempo real)
5. Visualize os resultados:
   - Dashboard com estatísticas
   - Clique nos cards para filtrar por status
   - Tabela completa com todos os resultados
6. Exporte os resultados clicando em **"Download CSV Report"**

## 🔌 API

### POST `/api/verify-email`

Verifica um único endereço de email.

**Request Body:**
\`\`\`json
{
  "email": "example@domain.com"
}
\`\`\`

**Response:**
\`\`\`json
{
  "email": "example@domain.com",
  "status": "valid",
  "is_valid_format": true,
  "is_disposable": false,
  "dns_valid": true,
  "smtp_valid": true,
  "details": {
    "format": "✓ Valid format",
    "dns": "✓ DNS records found",
    "smtp": "✓ SMTP server responds",
    "disposable": "✓ Not a disposable email"
  }
}
\`\`\`

### POST `/api/verify-bulk`

Verifica múltiplos endereços de email.

**Request Body:**
\`\`\`json
{
  "emails": ["email1@domain.com", "email2@domain.com"]
}
\`\`\`

**Response:**
\`\`\`json
{
  "results": [
    {
      "email": "email1@domain.com",
      "status": "valid",
      "is_valid_format": true,
      "is_disposable": false,
      "dns_valid": true,
      "smtp_valid": true
    }
  ]
}
\`\`\`

## 🔐 Privacidade e Compliance

Esta ferramenta foi desenvolvida com privacidade em mente:

- ✅ **Zero armazenamento**: Nenhum email ou resultado é salvo em banco de dados
- ✅ **Processamento em memória**: Todos os dados são processados temporariamente
- ✅ **Descarte automático**: Dados são eliminados imediatamente após a verificação
- ✅ **GDPR compliant**: Totalmente compatível com regulamentações de privacidade
- ✅ **Sem cookies de rastreamento**: Apenas processamento de verificação

## 🎨 Design

- **Cores**: Sistema de 3-5 cores com tom principal azul (#1E40AF)
- **Tipografia**: Fonte Geist Sans para interface moderna
- **Layout**: Mobile-first com design responsivo
- **Acessibilidade**: Suporte completo para leitores de tela (aria-live regions)

## 📁 Estrutura do Projeto

\`\`\`
email-verification-tool/
├── app/
│   ├── api/
│   │   ├── verify-email/route.ts    # API de verificação individual
│   │   └── verify-bulk/route.ts     # API de verificação em lote
│   ├── layout.tsx                    # Layout principal
│   ├── page.tsx                      # Página principal
│   └── globals.css                   # Estilos globais
├── components/
│   ├── ui/                           # Componentes shadcn/ui
│   └── privacy-badge.tsx             # Badge de privacidade
├── lib/
│   ├── email-validator.ts            # Lógica de validação
│   └── utils.ts                      # Utilitários
└── public/                           # Arquivos estáticos
\`\`\`

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Créditos

- **Desenvolvido por**: Townsend Solutions
- **Design por**: Vergara Design
- **Tecnologia**: Vercel v0

## 📞 Suporte

Para suporte ou questões, entre em contato através de:
- Website: [Townsend Solutions](https://vergaratec.com/townsend)
- Email: support@townsend.com

---

**Townsend Solutions - All Rights Reserved. Design by Vergara Design.**
