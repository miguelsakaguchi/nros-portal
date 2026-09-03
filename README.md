# NROS — Gestão Psicossocial

Plataforma de gestão de riscos psicossociais para apoiar responsáveis de SST e RH no cumprimento da NR-1.

O NROS transforma respostas anônimas de funcionários em uma visão executiva dos fatores de risco, recomendações de ação e um plano de ação documentado para acompanhamento e anexação ao PGR.

> **Status:** MVP funcional para demonstração e validação com empresa-piloto. Os dados atuais da API são exemplos em memória; a persistência em PostgreSQL é o próximo passo para uso em produção.

## Problema

Empresas de médio porte precisam identificar, avaliar e gerenciar riscos psicossociais dentro do PGR, mas muitas ainda dependem de planilhas, formulários genéricos ou consultorias pontuais. Essas alternativas dificultam a análise por setor, a priorização de ações e a geração de evidências para uma fiscalização.

O NROS foi desenhado para tornar esse processo recorrente, anônimo e orientado à ação:

1. O responsável de SST/RH configura o ciclo de avaliação.
2. Funcionários respondem a um questionário psicossocial padronizado pelo celular.
3. As respostas são agregadas e analisadas por fator de risco e setor.
4. O gestor revisa os resultados e monta um plano de ação priorizado.
5. O relatório pode ser exportado para documentação do PGR.

## Funcionalidades do MVP

- **Painel executivo:** índice psicossocial, taxa de resposta, riscos críticos, ações pendentes e evolução entre ciclos.
- **Riscos psicossociais:** busca, filtros por nível e leitura por fator de risco.
- **Plano de ação:** visualização das ações prioritárias e criação de novas ações pelo gestor.
- **Avaliação anônima:** fluxo mobile-first com etapas, progresso, privacidade e envio das respostas.
- **Relatórios:** histórico de ciclos, resultados agregados e exportação do plano de ação.
- **API tipada:** contratos OpenAPI, validação com Zod e hooks React gerados automaticamente.
- **Design system NROS:** componentes e tokens compartilhados para manter consistência visual entre os produtos.

## Escopo e limites

O produto apoia a gestão do módulo psicossocial da NR-1. Ele:

- não realiza diagnóstico clínico;
- não oferece aconselhamento psicológico individual;
- não substitui o SESMT nem assina tecnicamente o PGR;
- não cobre as demais Normas Regulamentadoras ou o PGR completo;
- não é um canal de denúncia ou ouvidoria de assédio.

A responsabilidade legal pelas decisões e pelo PGR continua sendo da empresa e de seus responsáveis técnicos.

## Stack

- **Linguagem:** TypeScript
- **Frontend:** React + Vite
- **Backend:** Express 5
- **Banco planejado:** PostgreSQL + Drizzle ORM
- **Validação:** Zod
- **Contratos e geração:** OpenAPI + Orval
- **Monorepo:** pnpm workspaces
- **Runtime:** Node.js 24

## Estrutura do repositório

```text
artifacts/
├── api-server/          # API Express e rotas do NROS
├── nros-design-system/  # Tokens e componentes visuais compartilhados
├── nros-portal/         # Portal React para gestores e SST
└── mockup-sandbox/      # Preview isolado de componentes

lib/
├── api-client-react/    # Hooks React gerados a partir do OpenAPI
├── api-spec/            # Contrato OpenAPI e código gerado
└── db/                  # Pacote de banco e schema Drizzle
```

## Como executar

### Pré-requisitos

- Node.js 24
- pnpm
- PostgreSQL configurado quando as rotas persistidas forem habilitadas

### Instalação

```bash
pnpm install
```

### Iniciar os serviços

Em terminais separados:

```bash
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/nros-portal run dev
```

O portal é servido pelo workflow do Replit. A API usa a porta definida pela variável `PORT`.

### Comandos úteis

```bash
# Verificar tipos em todo o workspace
pnpm run typecheck

# Fazer o build de todos os pacotes
pnpm run build

# Regenerar cliente React e schemas a partir do OpenAPI
pnpm --filter @workspace/api-spec run codegen

# Aplicar alterações de schema no banco de desenvolvimento
pnpm --filter @workspace/db run push
```

## API

O servidor expõe as seguintes rotas principais:

| Método | Rota | Finalidade |
| --- | --- | --- |
| `GET` | `/api/healthz` | Verificar a saúde da API |
| `GET` | `/api/dashboard` | Obter métricas e insights do painel |
| `GET` | `/api/risks` | Listar riscos psicossociais |
| `GET` | `/api/action-plans` | Listar ações do ciclo |
| `POST` | `/api/action-plans` | Criar uma ação |
| `GET` | `/api/assessment` | Obter o questionário do ciclo |
| `POST` | `/api/assessment/response` | Enviar uma resposta anônima |

O contrato completo está em `lib/api-spec/openapi.yaml`.

## Metas do produto

O critério principal de sucesso é que uma empresa-piloto consiga completar um ciclo sem intervenção manual:

- pelo menos **60% de taxa de resposta** dos funcionários;
- um plano de ação psicossocial documentado;
- um relatório exportado e anexável ao PGR;
- conclusão do ciclo até o Demo Day de **08/10/2026**.

## Referências

- Portaria MTE nº 1.419/2024
- Texto atualizado da NR-1
- PRD do produto: `attached_assets/Prd_NR-1_1787227095297.pdf`

## Licença

Projeto em desenvolvimento para validação do produto NROS.