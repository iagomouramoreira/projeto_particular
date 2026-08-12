const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatBRL(cents: number): string {
  return BRL.format(cents / 100);
}

export function parseMoneyToCents(input: string): number {
  const raw = input.trim();
  if (!raw) {
    throw new Error("Informe um valor.");
  }

  const negative = raw.startsWith("-");
  const unsigned = raw.replace(/^[+-]/, "").replace(/[R$\s]/gi, "");

  if (!unsigned || !/^[\d.,]+$/.test(unsigned)) {
    throw new Error("Valor inválido.");
  }

  let normalized: string;
  const hasComma = unsigned.includes(",");
  const hasDot = unsigned.includes(".");

  if (hasComma && hasDot) {
    if (unsigned.lastIndexOf(",") > unsigned.lastIndexOf(".")) {
      normalized = unsigned.replace(/\./g, "").replace(",", ".");
    } else {
      normalized = unsigned.replace(/,/g, "");
    }
  } else if (hasComma) {
    normalized = unsigned.replace(",", ".");
  } else {
    normalized = unsigned;
  }

  const value = Number(normalized);
  if (!Number.isFinite(value)) {
    throw new Error("Valor inválido.");
  }

  const cents = Math.round(value * 100);
  return negative ? -cents : cents;
}
