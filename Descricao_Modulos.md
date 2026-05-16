# Base de Conhecimento e Instruções para Agentes de IA - Módulos OEEC

Este documento serve como diretriz fundamental (prompt base/system instructions) para agentes de inteligência artificial (LLMs) encarregados de arquitetar, codificar e implantar a plataforma OEEC (Observatório de Eficiência Energética das Cidades). 

**Contexto:**
O OEEC é uma plataforma SaaS de inteligência energética, ESG e climática para cidades, indústrias e organizações, baseada em metodologias do GHG Protocol.

---

## Estrutura de Módulos: GHG Protocol — Energia e Combustão

A aplicação deve implementar os seguintes submódulos principais. Para cada um, siga estritamente os campos, regras de negócio e saídas (outputs) especificados.

### 1. Introdução / Cadastro do Inventário
**Objetivo:** Permitir a abertura e configuração inicial de um inventário anual.

**Requisitos de Dados (Entradas):**
- Nome da organização
- Endereço completo
- Ano inventariado (numérico, YYYY)
- Responsável técnico (nome, cargo)
- Telefone / E-mail de contato
- Data de preenchimento (timestamp)
- Unidade operacional (caso haja múltiplas)
- Cidade / Estado
- Setor econômico (dropdown / categorias padronizadas)
- Tipo de organização (Enum: Pública, Privada, Indústria, Município, Concessionária, etc.)

**Requisitos de UI/UX & Saídas:**
- Formulário validado para criação do inventário.
- Geração automática de uma "trilha de auditoria" (logs de criação e edição).
- Painel de completude (barra de progresso indicando quais submódulos já foram preenchidos).
- Status de preenchimento (Rascunho, Em andamento, Concluído, Auditado).

### 2. Combustão Estacionária (Escopo 1)
**Objetivo:** Calcular emissões diretas geradas pela queima de combustíveis em fontes fixas.

**Exemplos de Fontes para o Banco de Dados:** Geradores, caldeiras, fornos, boilers, equipamentos industriais (Tipos de Combustível: GLP, Gás Natural, Diesel, Óleo Combustível, Biomassa).

**Requisitos de Dados (Entradas por registro):**
- Identificação/Registro da fonte
- Descrição da fonte
- Setor
- Tipo de combustível selecionado
- Quantidade consumida (numérico)
- Unidade de medida (L, kg, m³, etc. dependendo do combustível)
- Fator de conversão (se aplicável)
- Fatores de Emissão (CO₂, CH₄, N₂O) - *Devem vir preferencialmente de um banco de dados dinâmico de fatores, permitindo sobrescrita (override) se o usuário possuir laudos específicos.*

**Lógica de Cálculo (Backend):**
- Emissão de Gás = Quantidade Consumida * Fator de Emissão do Gás (para CO₂, CH₄, N₂O)
- Emissões Totais (CO₂e) = Soma das emissões de cada gás multiplicadas pelo seu respectivo Potencial de Aquecimento Global (GWP).
- Separar cálculo de CO₂ biogênico, quando aplicável (ex: queima de biomassa).

**Requisitos de UI/UX & Saídas (Dashboard):**
- Gráficos de emissões sumarizadas por fonte e por combustível.
- Agrupamento por unidade operacional.
- Ranking (tabela) das maiores fontes emissoras.

### 3. Energia Elétrica — Abordagem por Localização (Escopo 2)
**Objetivo:** Calcular emissões indiretas (Escopo 2) pela compra de eletricidade, baseando-se no fator médio do Sistema Interligado Nacional (SIN).

**Requisitos de Dados (Entradas):**
- Registro/Descrição da fonte
- Unidade/Local
- Consumo mensal (MWh) e cálculo automático do Consumo anual (MWh)
- Fator mensal do SIN (tabela de referência do sistema)
- Fator médio anual (calculado/referência)

**Lógica de Cálculo (Backend):**
- Emissões = Consumo de Eletricidade (MWh) * Fator de Emissão do SIN correspondente.

**Requisitos de UI/UX & Saídas:**
- Exibição de Emissões totais de Escopo 2 (Localização).
- Gráfico de consumo mensal versus emissões mensais.
- Indicador de "Intensidade Energética" (ex: Consumo / Área ou Consumo / Faturamento).
- Drill-down geográfico: emissões por cidade/unidade.

### 4. Perdas na Transmissão e Distribuição (Escopo 3)
**Objetivo:** Calcular emissões associadas às perdas de energia elétrica (T&D).

**Requisitos de Dados (Entradas):**
- Registro e Descrição
- Perdas mensais e anuais (MWh) - *Pode ser imputado diretamente ou calculado por um percentual padrão sobre o consumo total*.
- Fator de emissão do SIN

**Lógica de Cálculo (Backend):**
- Emissões = Perdas em MWh * Fator de Emissão (cálculo para CO₂, CH₄, N₂O e total em CO₂e).

**Requisitos de UI/UX & Saídas:**
- Dashboard específico para emissões por perdas T&D.
- KPI: Percentual de perda em relação ao consumo total.
- KPI: Indicador de eficiência da infraestrutura energética (comparativo).

### 5. Compra de Energia Térmica (Escopo 2 - Indireto)
**Objetivo:** Calcular emissões indiretas pela compra de vapor ou energia térmica de terceiros.

**Requisitos de Dados (Entradas):**
- Registro / Descrição
- Combustível utilizado pela usina fornecedora
- Eficiência do fervedor/caldeira (%)
- Vapor comprado (GJ)
- Fatores de emissão do combustível utilizado

**Lógica de Cálculo (Backend):**
- Consumo energético estimado = Vapor comprado ÷ Eficiência do fervedor.
- Emissões = Consumo energético estimado * Fatores de emissão do combustível.

**Requisitos de UI/UX & Saídas:**
- Total de emissões por compra de vapor (CO₂e e detalhado).
- Separação de CO₂ biogênico se o combustível da térmica for renovável (ex: bagaço de cana).

### 6. Escolha de Compra da Energia Elétrica (Escopo 2 - Market-Based)
**Objetivo:** Calcular o Escopo 2 pela abordagem de "Escolha de Compra" (Market-based), considerando contratos específicos (Mercado Livre, I-RECs).

**Requisitos de Dados (Entradas):**
- Registro / Descrição
- Tipo de geração contratada (Enum: Solar, Eólica, Biomassa, Térmica, Hídrica, etc.)
- Combustível da fonte (se aplicável)
- Flag: Possui fator de emissão próprio? (Booleano)
- Eficiência da planta geradora (se aplicável)
- Energia comprada (Mensal/Anual em MWh)
- Fator de emissão fornecido pelo gerador (se aplicável)
- Fator sugerido pela ferramenta (fallback)

**Requisitos de UI/UX & Saídas:**
- Emissões totais baseadas na escolha de compra.
- KPI: Percentual de energia renovável na matriz de consumo.
- Gráfico: Energia Rastreada (certificados) vs Energia Não Rastreada.
- **Comparativo Visual Crítico:** Gráfico lado a lado comparando "Emissões por Localização" vs "Emissões por Escolha de Compra".

---

## Diretrizes de Implementação do Sistema (Workflow)

Os agentes de IA (Frontend, Backend, Database) devem construir o sistema garantindo que a jornada do usuário respeite o seguinte fluxo:

1. O usuário cria um novo Inventário Anual.
2. Cadastra as Unidades Consumidoras associadas à organização.
3. Seleciona dinamicamente quais submódulos (1 a 6) se aplicam ao inventário atual.
4. Insere dados de consumo. O sistema deve suportar inserção manual (formulários dinâmicos), importação em lote (CSV/Excel) e integração via APIs.
5. Faz upload de anexos/evidências (contas de luz, contratos, laudos, notas fiscais) para auditoria, vinculando-os a cada registro de fonte/consumo.
6. A plataforma reage de forma reativa e assíncrona, calculando emissões e atualizando os totais imediatamente após o input.
7. Os dashboards de resultados, relatórios (PDF/Excel) e posições no ranking são gerados e exibidos em tempo real.

## Requisitos Não-Funcionais e Funcionalidades Core
Ao programar a aplicação, inclua estas funcionalidades transversais:
- **Armazenamento Seguro de Evidências:** Integração com buckets (ex: AWS S3, Firebase Storage) para notas fiscais e contratos.
- **Banco de Dados Dinâmico de Fatores de Emissão:** Tabela isolada para fatores de emissão do GHG Protocol, atualizável globalmente por administradores.
- **Motor de Validação de Dados:** Implementar alertas de inconsistência (ex: consumo que sobe 500% de um mês para o outro ou fatores fora do padrão).
- **Comparação e Histórico:** Visualizações comparando meses do ano atual com meses de anos anteriores.
- **Geração de Relatórios:** Exportação do Inventário GHG Protocol padronizado (PDF, Excel).
- **Dashboard ESG:** Tradução automática dos dados do GHG Protocol para indicadores ESG (Environmental, Social, Governance) visualmente atrativos.

## Parâmetros para o Ranking Nacional de Eficiência Energética

Se a arquitetura incluir o Módulo de Ranking, utilize os seguintes pesos para calcular o score de eficiência da entidade cadastrada:

| Indicador Principal | Peso no Score |
| :--- | :--- |
| Consumo total de energia | 15% |
| Consumo por unidade (Intensidade - Prod / Pop / Área) | 20% |
| Emissões de Escopo 2 (Abordagem de Localização) | 15% |
| Emissões por escolha de compra | 15% |
| Percentual de energia renovável | 15% |
| Perdas em transmissão e distribuição (T&D) | 10% |
| Transparência e qualidade dos dados | 10% |

**Classificação Resultante (Tiers / Selos OEEC):**
- **Classe A** — Alta eficiência energética
- **Classe B** — Boa eficiência
- **Classe C** — Em transição
- **Classe D** — Baixa eficiência
- **Classe E** — Crítica

---
**Instrução Final para o Agente:** Utilize este documento como a "Bíblia de Domínio" (Domain Knowledge) para qualquer modelagem de dados, arquitetura de software, design de APIs, criação de componentes de UI/UX ou implementação de lógicas de negócio e motor de cálculo associados ao Módulo de Inventário da plataforma OEEC.