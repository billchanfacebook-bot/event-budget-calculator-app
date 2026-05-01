"use client";

import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

type SubmitButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    pendingLabel?: string;
  }
>;

export function SubmitButton({
  children,
  className,
  disabled,
  pendingLabel = "Saving...",
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className={cn("disabled:cursor-not-allowed disabled:opacity-70", className)}
      disabled={disabled || pending}
      {...props}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
