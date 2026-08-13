import assert from "node:assert/strict";
import test from "node:test";
import { formatBRL, parseMoneyToCents } from "./money";

test("parseia valores no formato brasileiro", () => {
  assert.equal(parseMoneyToCents("1.234,56"), 123456);
  assert.equal(parseMoneyToCents("R$ 80,00"), 8000);
  assert.equal(parseMoneyToCents("250"), 25000);
  assert.equal(parseMoneyToCents("250.5"), 25050);
  assert.equal(parseMoneyToCents("-10,90"), -1090);
});

test("formata centavos em real", () => {
  const formatted = formatBRL(123456).replace(/\s/g, " ");
  assert.match(formatted, /R\$ 1\.234,56/);
  assert.match(formatBRL(0).replace(/\s/g, " "), /R\$ 0,00/);
});

test("rejeita valor vazio ou inválido", () => {
  assert.throws(() => parseMoneyToCents(""), /Informe um valor/);
  assert.throws(() => parseMoneyToCents("abc"), /inválido/);
});
