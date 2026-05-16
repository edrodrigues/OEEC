# OEEC - Observatório de Eficiência Energética das Cidades

O **OEEC** é uma plataforma SaaS avançada de inteligência energética, gestão ESG e monitoramento climático. Projetada para cidades, indústrias e organizações, a plataforma utiliza a metodologia do **GHG Protocol** para transformar dados de consumo em insights estratégicos e indicadores de sustentabilidade.

---

## 🌟 Visão Geral

O OEEC simplifica a jornada de descarbonização e eficiência energética, permitindo que gestores públicos e privados realizem inventários precisos, monitorem emissões de gases de efeito estufa (GEE) e comparem seu desempenho através de um Ranking Nacional de Eficiência.

### Objetivos Principais
- **Gestão Climática:** Automatizar o cálculo de pegada de carbono (Escopos 1, 2 e 3).
- **Eficiência Energética:** Identificar gargalos de consumo e perdas técnicas.
- **Transparência ESG:** Gerar relatórios auditáveis e dashboards para stakeholders.
- **Benchmarking:** Posicionar entidades em um ranking nacional baseado em critérios técnicos.

---

## 🛠️ Módulos e Funcionalidades

A plataforma é estruturada em módulos dinâmicos que seguem rigorosamente as diretrizes internacionais:

1.  **Gestão de Inventários:** Abertura e configuração de inventários anuais com trilha de auditoria.
2.  **Combustão Estacionária (Escopo 1):** Cálculo de emissões diretas (geradores, caldeiras, fornos).
3.  **Energia Elétrica (Escopo 2):** Monitoramento via abordagens de Localização (SIN) e Escolha de Compra (I-RECs/Mercado Livre).
4.  **Perdas T&D (Escopo 3):** Cálculo de emissões associadas a perdas na transmissão e distribuição.
5.  **Energia Térmica:** Gestão de compra de vapor e energia térmica de terceiros.
6.  **Ranking e Dashboards:** Visualização em tempo real de KPIs, intensidade energética e selos de eficiência (Classe A a E).

---

## 🚀 Guia de Configuração (Desenvolvedores/Técnicos)

### Requisitos Prévios
- **Node.js** (v18 ou superior)
- **Firebase Project** (Firestore, Auth e Storage ativos)

### Instalação

1. Clone o repositório:
   ```bash
   git clone [url-do-repositorio]
   cd OEEC/web
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

### Variáveis de Ambiente

Crie um arquivo `.env.local` na pasta `/web` e configure as credenciais do seu projeto Firebase:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id
```

### Execução

Para iniciar o servidor de desenvolvimento:
```bash
npm run dev
```
Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 🏗️ Stack Tecnológica

- **Frontend:** [Next.js](https://nextjs.org/) (React 19)
- **Estilização:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Backend/Database:** [Firebase](https://firebase.google.com/) (Firestore & Auth)
- **Visualização:** [Recharts](https://recharts.org/) para gráficos dinâmicos
- **Ícones:** [Lucide React](https://lucide.dev/)

---

## 📂 Documentação de Referência

Para detalhes aprofundados sobre a arquitetura e lógica de negócio, consulte:
- [Mapa_Estrutural.md](Mapa_Estrutural.md) - Arquitetura de software e fluxos de dados.
- [Descricao_Modulos.md](Descricao_Modulos.md) - Detalhamento técnico dos módulos e lógicas de cálculo.
- [DESIGN.md](DESIGN.md) - Guia de estilo e componentes de UI/UX.
- [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md) - Cronograma e fases de implementação.

---
**OEEC** - Rumo a um futuro mais eficiente e sustentável.

