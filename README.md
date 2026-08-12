# projeto_particular

Controle financeiro pessoal: contas fixas do mês, gastos não programados, receitas recebidas, parcelas, metas e um resumo do que sobrou.

## Como rodar

```bash
cp .env.example .env
npm install
npm run setup
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## O que tem no app

- **Visão do mês:** receitas, contas, gastos, saldo e contas atrasadas
- **Contas fixas:** vencimento, marcar como paga, valor variável (água/luz)
- **Gastos:** lançamentos do dia a dia, com marcação de não programado
- **Receitas:** o que realmente entrou
- **Parcelas:** prestações diluídas nos meses
- **Metas:** reserva de emergência ou objetivo com aportes
- **Relatórios:** comparação dos últimos 6 meses e saídas por categoria

Os valores ficam em um banco SQLite local (`prisma/dev.db`). Nada vai para a nuvem.

## Testes

```bash
npm test
npm run lint
```
