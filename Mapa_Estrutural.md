# Base de Conhecimento e Instruções para Agentes de IA - Arquitetura e Estrutura OEEC

Este documento define a **Arquitetura de Software, Estrutura de Banco de Dados, Mapeamento de UI/UX e Fluxo de Dados** para a construção da plataforma OEEC (Observatório de Eficiência Energética das Cidades). Agentes de IA devem utilizar este documento como guia central para planejar e estruturar o projeto.

---

## 1. Arquitetura Geral da Plataforma (Módulos)

A aplicação deve ser estruturada com as seguintes namespaces / rotas principais, encapsulando regras de negócio específicas:

- **Core / Governança:** Cadastro de usuários, organizações, municípios, unidades operacionais, gestão de permissões (RBAC) e auditoria de logs.
- **Módulo Inventário Energético:** Combustão Estacionária, Energia Elétrica, Energia Térmica, Perdas T&D, Escolha de Compra e Histórico Anual.
- **Módulo Inventário de Carbono:** Cálculos para Escopo 1, Escopo 2, Escopo 3, gerenciamento de Fatores de Emissão dinâmicos e exportação de Relatórios GHG Protocol.
- **Módulo ESG:** Gestão de indicadores Ambientais, Sociais e de Governança (ODS) e sistema de Benchmarking.
- **Módulo Ranking Nacional:** Algoritmo do Índice OEEC, Ranking de Cidades, Ranking de Indústrias, concessão de Selos ESG e Score Energético.
- **Módulo Inteligência Territorial:** Integração com mapas, Heatmaps, visualização de dados regionais, vulnerabilidade climática e eficiência territorial.
- **Módulo Relatórios:** Geração assíncrona de PDF, Excel, visualização de Dashboards, Relatórios ESG e Climáticos.
- **API e Integrações:** Camada para consumo de APIs públicas, recepção de dados de Smart Meters, dispositivos IoT, ERPs e envio para plataformas de BI.

---

## 2. Mapa de Telas e Especificações de UI/UX (Frontend)

Agentes focados em Frontend devem planejar os componentes e o roteamento (routing) baseados nas seguintes telas principais:

### TELA 01 — Autenticação (Login/Onboarding)
- **Funcionalidades:** Login padrão (e-mail/senha), Login Social (Google, etc.), MFA (Autenticação de Múltiplos Fatores), e Fluxo de Recuperação de Senha.

### TELA 02 — Dashboard Executivo
- **Componentes Principais:** Cards de resumo (Consumo energético total, Emissões totais, Intensidade energética, Percentual renovável, Posição no Ranking, Evolução anual).
- **Visualizações Avançadas:** Gráficos interativos, Mapa do Brasil indicando operações, tabela de Ranking comparativo e widgets de indicadores ESG.

### TELA 03 — Cadastro da Organização
- **Formulário Dinâmico:** Nome, CNPJ (com validação e máscara), Setor, Cidade/Estado, Porte, Número de unidades.
- **Campos Condicionais:** População (se for um Município), Área construída, Número de colaboradores.

### TELA 04 — Inventário Energético (Interface com Abas)
- **Aba 1 - Introdução:** Ano inventariado, metodologia utilizada, responsável técnico, campo de observações (Rich Text).
- **Aba 2 - Combustão Estacionária:** Tabela dinâmica (DataGrid) com colunas: combustível, quantidade, unidade, fator de emissão, emissões detalhadas (CO₂, CH₄, N₂O) e total (CO₂e). Suporte a CRUD inline.
- **Aba 3 - Energia Elétrica (Localização):** Inputs para consumo mensal e anual; exibição automática dos fatores do SIN e emissões calculadas.
- **Aba 4 - Perdas T&D:** Formulário simples para imputação de perdas mensais e anuais, e suas emissões.
- **Aba 5 - Compra de Energia Térmica:** Inputs de consumo de vapor, combustível, eficiência da térmica e emissões resultantes.
- **Aba 6 - Escolha de Compra:** Formulário de rastreabilidade da energia, tipo de geração, percentual de certificados renováveis e fatores informados pelo fornecedor.

### TELA 05 — Dashboard GHG Protocol
- **Visualizações:** Gráficos separados visualmente por Escopo (1, 2 e 3), gráfico do tipo "pizza/donut" para emissões por fonte, e gráfico de linha para a intensidade carbônica ao longo do tempo.

### TELA 06 — Ranking Nacional
- **Filtros Avançados:** Componente de busca por Cidade, Estado, Setor, Indústria e Porte.
- **Resultados Visuais:** Exibição do Score numérico, imagem do Selo OEEC conquistado, posição nacional e gráfico radar comparativo com outras entidades da mesma região.

### TELA 07 — Mapa Inteligente (Integração GIS/Mapas)
- **Camadas (Layers):** Controles tipo "Toggle" para ativar visualização georreferenciada de: consumo energético, emissões, saneamento, mobilidade, energia renovável e manchas de vulnerabilidade climática.

### TELA 08 — Central de Relatórios
- **Funcionalidades:** Botões de ação primária para Exportação (PDF Executivo, Planilha de dados em massa) e navegação para relatórios específicos (Dashboard gerencial, Relatório ESG, Relatório detalhado GHG Protocol).

---

## 3. Pipeline Lógico: Motor de Cálculo (Backend)

Agentes focados em Backend devem estruturar o processamento dos dados do inventário respeitando o seguinte fluxo sequencial (pipeline):

1. **DADOS DE ENTRADA:** Recepção via formulário (API) ou planilhas (batch processing).
2. **VALIDAÇÃO:** Validação de formato, tipagem e regras de negócio (limites lógicos).
3. **CONVERSÃO DE UNIDADES:** Normalização automática das medidas (ex: ajustar tudo para MWh ou Litros).
4. **FATORES DE EMISSÃO:** Consulta ao banco de dados para injetar o fator de conversão exato do período.
5. **CÁLCULO DE GASES:** Múltiplas etapas de cálculo para obter a massa de CO₂, CH₄ e N₂O individualmente.
6. **EQUIVALÊNCIA (CO₂e):** Aplicação do Potencial de Aquecimento Global (GWP) aos gases para consolidar o CO₂e total.
7. **SCORING ESG:** Alimentação do motor de pontuação baseado em heurísticas de eficiência.
8. **RANKING OEEC:** Atualização assíncrona da posição da entidade no Ranking Nacional.
9. **VISUALIZAÇÃO:** Armazenamento dos resultados finais e notificação ao Frontend (ex: WebSockets) para atualização da tela.
10. **GERAÇÃO DE RELATÓRIOS:** Geração assíncrona dos arquivos para download.

---

## 4. Estrutura do Banco de Dados (Data Modeling)

Agentes focados em Banco de Dados (SQL, preferencialmente) devem criar as seguintes tabelas (ou coleções NoSQL correspondentes) com os seguintes relacionamentos base:

- **Usuários:** `id` (PK), `nome`, `e-mail` (Unique), `senha` (Hash), `perfil` (Role), `organizacao_id` (FK).
- **Organizações:** `id` (PK), `nome`, `CNPJ` (Unique), `setor`, `tipo_organizacao`, `cidade_estado`, `dados_extras` (JSON/JSONB para flexibilidade).
- **Inventários:** `id` (PK), `ano_referencia`, `organizacao_id` (FK), `status_preenchimento`, `data_criacao`, `data_auditoria`.
- **Banco de Fatores de Emissão:** `id` (PK), `categoria`, `combustivel_fonte`, `fator_co2`, `fator_ch4`, `fator_n2o`, `ano_vigencia`. *(Deve ser mantido de forma centralizada).*
- **Consumo / Lançamentos Energéticos:** `id` (PK), `inventario_id` (FK), `unidade_id` (FK), `tipo_entrada` (ex: escopo1_estacionaria, escopo2_eletrica), `quantidade`, `unidade_medida`, `mes_ano`, `dados_emissao_calculada` (JSON/JSONB com os totais de gases).
- **Rankings (Scorecards):** `id` (PK), `organizacao_id` (FK), `ano_referencia`, `score_total` (Float/Decimal), `classificacao_tier` (Enum A-E), `selo_id`.

---

## 5. Funcionalidades Premium (Requisitos para Agentes de IA/Data)

Agentes focados em IA devem planejar ganchos (hooks) na arquitetura para adicionar futuramente as seguintes capacidades de "Smart Analytics":

- **Previsão de Consumo (Forecasting):** Uso de algoritmos de Séries Temporais para projetar consumos e emissões futuras.
- **Benchmark Automático:** Clusterização de organizações do mesmo setor para mostrar onde o usuário está errando/acertando em comparação ao mercado.
- **Detecção de Anomalias:** Algoritmos que flagram aumentos repentinos ou atípicos em consumos mensais para prevenir erros de digitação e fraudes (trigger de auditoria).
- **Recomendações ESG com IA Generativa:** Geração de pareceres técnicos e planos de ação textuais sugeridos automaticamente com base no perfil do inventário calculado.