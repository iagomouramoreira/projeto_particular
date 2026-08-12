import Link from "next/link";
import { MONTH_NAMES, monthQuery, shiftMonth } from "@/lib/dates";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function MonthNav({
  year,
  month,
  pathname,
}: {
  year: number;
  month: number;
  pathname: string;
}) {
  const prev = shiftMonth(year, month, -1);
  const next = shiftMonth(year, month, 1);

  return (
    <div className="flex items-center gap-2 rounded-full border border-line bg-card px-2 py-1.5">
      <Link
        href={`${pathname}?${monthQuery(prev.year, prev.month)}`}
        className="rounded-full p-1.5 text-muted hover:bg-paper hover:text-ink"
        aria-label="Mês anterior"
      >
        <ChevronLeft size={18} />
      </Link>
      <p className="min-w-40 text-center text-sm font-semibold">
        {MONTH_NAMES[month - 1]} {year}
      </p>
      <Link
        href={`${pathname}?${monthQuery(next.year, next.month)}`}
        className="rounded-full p-1.5 text-muted hover:bg-paper hover:text-ink"
        aria-label="Próximo mês"
      >
        <ChevronRight size={18} />
      </Link>
    </div>
  );
}
