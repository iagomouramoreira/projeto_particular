"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center justify-center rounded-full bg-pine px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-pine-dark disabled:opacity-60 ${className}`}
    >
      {pending ? "Salvando..." : children}
    </button>
  );
}

export function ConfirmDeleteButton({
  action,
  id,
  label = "Excluir",
  message = "Excluir este registro?",
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  label?: string;
  message?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(message)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="text-sm font-medium text-rose hover:underline"
      >
        {label}
      </button>
    </form>
  );
}
