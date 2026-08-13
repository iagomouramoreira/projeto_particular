import type { ButtonHTMLAttributes, ReactNode } from "react";
import { formatBRL } from "@/lib/money";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-3xl border border-line bg-card p-5 shadow-[0_12px_40px_rgba(28,24,20,0.05)] ${className}`}
    >
      {children}
    </section>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-gold">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-display text-3xl tracking-tight text-ink sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function Money({
  cents,
  className = "",
  signed = false,
}: {
  cents: number;
  className?: string;
  signed?: boolean;
}) {
  const tone = signed
    ? cents > 0
      ? "text-ok"
      : cents < 0
        ? "text-rose"
        : "text-muted"
    : "";
  return (
    <span className={`tabular-nums ${tone} ${className}`}>{formatBRL(cents)}</span>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-line px-5 py-10 text-center">
      <p className="font-display text-xl text-ink">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
        {description}
      </p>
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold tracking-wide text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}

export function PrimaryButton({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-full bg-pine px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-pine-dark disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-full border border-line bg-white px-3 py-2 text-sm font-medium text-ink transition hover:border-pine hover:text-pine ${className}`}
    >
      {children}
    </button>
  );
}

export function StatusPill({
  status,
}: {
  status: "pago" | "pendente" | "atrasado";
}) {
  const styles = {
    pago: "bg-ok/10 text-ok",
    pendente: "bg-gold/15 text-warn",
    atrasado: "bg-rose/10 text-rose",
  } as const;
  const labels = {
    pago: "Paga",
    pendente: "Pendente",
    atrasado: "Atrasada",
  } as const;

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
