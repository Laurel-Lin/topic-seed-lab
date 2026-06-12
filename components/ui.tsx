"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md border font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" ? "h-8 px-3 text-sm" : "h-10 px-4 text-sm",
        variant === "primary" && "border-moss bg-moss text-white hover:bg-ink",
        variant === "secondary" && "border-sage bg-white text-ink hover:border-moss",
        variant === "ghost" && "border-transparent bg-transparent text-ink hover:bg-sage/60",
        variant === "danger" && "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
        className
      )}
      {...props}
    />
  );
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-lg border border-ink/10 bg-white/82 shadow-soft", className)} {...props} />;
}

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-moss/20 bg-sage/60 px-2.5 py-1 text-xs font-medium text-moss",
        className
      )}
      {...props}
    />
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-10 w-full rounded-md border border-ink/15 bg-white px-3 text-sm outline-none transition placeholder:text-ink/35 focus:border-moss focus:ring-2 focus:ring-moss/15",
        props.className
      )}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-28 w-full resize-y rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none transition placeholder:text-ink/35 focus:border-moss focus:ring-2 focus:ring-moss/15",
        props.className
      )}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "h-10 w-full rounded-md border border-ink/15 bg-white px-3 text-sm outline-none transition focus:border-moss focus:ring-2 focus:ring-moss/15",
        props.className
      )}
    />
  );
}

export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-2.5 overflow-hidden rounded-full bg-sage", className)}>
      <div className="h-full rounded-full bg-clay transition-all" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function Field({
  label,
  children,
  hint
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-ink">{label}</span>
      {children}
      {hint ? <span className="text-xs text-ink/55">{hint}</span> : null}
    </label>
  );
}
