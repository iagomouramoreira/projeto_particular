# projeto_particular

Controle financeiro pessoal: contas fixas do mês, gastos não programados, receitas recebidas, parcelas, metas e um resumo do que sobrou.

## Como rodar no computador

É preciso ter o [Node.js](https://nodejs.org/) instalado (versão 20 ou mais nova).

```bash
git clone https://github.com/iagomouramoreira/projeto_particular.git
cd projeto_particular
git checkout cursor/controle-financeiro-particular-d1f9
cp .env.example .env
npm install
npm run setup
npm run dev
```

No computador, abra [http://localhost:3000](http://localhost:3000).

## Como abrir no celular (mesma Wi-Fi)

O app roda no computador. O celular só acessa pelo navegador, na mesma rede.

1. Computador e celular na **mesma Wi-Fi**.
2. No computador, rode `npm run dev`.
3. O terminal mostra um endereço de celular, no formato `http://192.168.x.x:3000`.
4. No celular, abra o Safari ou o Chrome e digite esse endereço.
5. No iPhone: Compartilhar → **Adicionar à Tela de Início**. No Android: menu → **Adicionar à tela inicial**.

Deixe o terminal aberto. Se fechar, o celular perde o acesso.

Se a página não abrir, no Windows libere o Node.js no firewall quando o sistema perguntar, ou permita a porta 3000 na rede privada.

Os valores ficam em um banco SQLite local (`prisma/dev.db`). Nada vai para a nuvem.

## O que tem no app

- **Visão do mês:** receitas, contas, gastos, saldo e contas atrasadas
- **Contas fixas:** vencimento, marcar como paga, valor variável (água/luz)
- **Gastos:** lançamentos do dia a dia, com marcação de não programado
- **Receitas:** o que realmente entrou
- **Parcelas:** prestações diluídas nos meses
- **Metas:** reserva de emergência ou objetivo com aportes
- **Relatórios:** comparação dos últimos 6 meses e saídas por categoria

## Testes

```bash
npm test
npm run lint
```
