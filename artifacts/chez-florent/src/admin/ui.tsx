import React from "react";

export function cn(
  ...parts: Array<string | false | null | undefined>
): string {
  return parts.filter(Boolean).join(" ");
}

export const ACCENT = "#b5471f";

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-stone-200 bg-white p-5 shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
};

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed";
  const variants: Record<string, string> = {
    primary: "bg-[#b5471f] text-white hover:bg-[#9c3c1a]",
    ghost:
      "bg-transparent text-stone-700 hover:bg-stone-100 border border-stone-300",
    danger:
      "bg-transparent text-red-700 hover:bg-red-50 border border-red-200",
  };
  return (
    <button className={cn(base, variants[variant], className)} {...props} />
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-stone-400">{hint}</span>}
    </label>
  );
}

const inputClass =
  "w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:border-[#b5471f] focus:outline-none focus:ring-1 focus:ring-[#b5471f]";

export function TextInput(
  props: React.InputHTMLAttributes<HTMLInputElement>,
) {
  return <input className={cn(inputClass, props.className)} {...props} />;
}

export function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      rows={3}
      {...props}
      className={cn(inputClass, "resize-y", props.className)}
    />
  );
}

export function Checkbox({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-stone-700">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-stone-300 text-[#b5471f] focus:ring-[#b5471f]"
        {...props}
      />
      {label}
    </label>
  );
}

export function ErrorText({ error }: { error: unknown }) {
  if (!error) return null;
  const message =
    error instanceof Error ? error.message : "Une erreur est survenue.";
  return <p className="mt-2 text-sm text-red-600">{message}</p>;
}
