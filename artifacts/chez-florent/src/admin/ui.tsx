import React, { useEffect, useState } from "react";

export function cn(
  ...parts: Array<string | false | null | undefined>
): string {
  return parts.filter(Boolean).join(" ");
}

export const ACCENT = "#D85A2C";

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
        "rounded-2xl border border-border bg-bg-secondary p-5 shadow-[0_1px_0_rgba(244,201,160,0.04)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <div className="mb-2 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-orange">
            <span aria-hidden="true">✶ </span>
            {eyebrow}
          </div>
        )}
        <h2 className="font-serif text-2xl leading-tight text-cream md:text-[1.75rem]">
          {title}
        </h2>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-cream-soft/70">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger" | "subtle";
};

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium tracking-[0.02em] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-orange focus-visible:outline-offset-2";
  const variants: Record<string, string> = {
    primary: "bg-orange text-bg-primary hover:bg-orange-dark",
    ghost:
      "bg-transparent text-cream-soft hover:bg-cream/5 border border-border-strong hover:border-cream-soft/40",
    subtle: "bg-bg-tertiary text-cream-soft hover:text-cream hover:bg-bg-tertiary/70 border border-border",
    danger:
      "bg-transparent text-red-300 hover:bg-red-500/10 border border-red-400/30",
  };
  return (
    <button className={cn(base, variants[variant], className)} {...props} />
  );
}

export function IconButton({
  className,
  label,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-bg-tertiary text-cream-soft transition-colors hover:text-cream hover:border-cream-soft/40 focus-visible:outline-2 focus-visible:outline-orange",
        className,
      )}
      {...props}
    />
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "orange" | "danger";
}) {
  const tones: Record<string, string> = {
    neutral: "border-border-strong text-cream-soft/80",
    orange: "border-orange/40 text-orange bg-orange/10",
    danger: "border-red-400/40 text-red-300 bg-red-500/10",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[0.65rem] font-medium uppercase tracking-[0.16em]",
        tones[tone],
      )}
    >
      {children}
    </span>
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
      <span className="mb-1.5 block text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-cream-soft/60">
        {label}
      </span>
      {children}
      {hint && (
        <span className="mt-1 block text-xs text-cream-soft/40">{hint}</span>
      )}
    </label>
  );
}

const inputClass =
  "w-full rounded-md border border-border bg-bg-tertiary px-3 py-2 text-sm text-cream placeholder:text-cream-soft/30 transition-colors focus:border-orange/60 focus:outline-none focus:ring-1 focus:ring-orange/50 [color-scheme:dark]";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
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
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-cream-soft">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-border-strong bg-bg-tertiary text-orange focus:ring-orange/50 [color-scheme:dark]"
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
  return <p className="mt-2 text-sm text-red-300">{message}</p>;
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-bg-primary/80 px-4 py-8 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-border-strong bg-bg-secondary p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-serif text-xl text-cream">{title}</h3>
          <IconButton label="Fermer" onClick={onClose}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </IconButton>
        </div>
        {children}
      </div>
    </div>
  );
}

export function SectionPreview({
  section,
  title = "Aperçu sur le site",
  description,
  height = 620,
  compact = false,
}: {
  section?: string;
  title?: string;
  description?: string;
  height?: number;
  compact?: boolean;
}) {
  const [nonce, setNonce] = useState(0);
  const base = import.meta.env.BASE_URL;
  const src = `${base}?preview=${section ?? "1"}`;
  return (
    <div className={compact ? "" : "mt-12 border-t border-border pt-8"}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          {!compact && (
            <div className="mb-1 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-orange">
              <span aria-hidden="true">✶ </span>Aperçu en direct
            </div>
          )}
          <h3
            className={
              compact
                ? "font-serif text-base text-cream"
                : "font-serif text-lg text-cream"
            }
          >
            {title}
          </h3>
          {description && (
            <p className="mt-0.5 text-sm text-cream-soft/55">{description}</p>
          )}
        </div>
        <Button variant="subtle" onClick={() => setNonce((n) => n + 1)}>
          ↻ Rafraîchir l'aperçu
        </Button>
      </div>
      <div className="overflow-hidden rounded-xl border border-border-strong bg-bg-primary">
        <iframe
          key={nonce}
          src={src}
          title={title}
          loading="lazy"
          className="w-full border-0"
          style={{ height }}
        />
      </div>
      {!compact && (
        <p className="mt-2 text-xs text-cream-soft/40">
          Cet aperçu reflète les données enregistrées. Après une modification,
          cliquez sur « Rafraîchir l'aperçu ».
        </p>
      )}
    </div>
  );
}
