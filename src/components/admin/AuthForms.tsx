"use client";

import Link from "next/link";
import { useActionState, useId } from "react";
import {
  requestPasswordResetAction,
  signInAction,
  updatePasswordAction,
  type AuthFormState,
} from "@/lib/admin/auth-actions";
import { PASSWORD_MIN } from "@/lib/admin/passwords";
import { errorClass, helpClass, inputClass, labelClass, primaryButton } from "./ui";

const initial: AuthFormState = { status: "idle" };

function FormMessage({ state }: { state: AuthFormState }) {
  if (!state.message) return null;
  const sent = state.status === "sent";
  return (
    <div
      role={sent ? "status" : "alert"}
      className={`mb-6 border-l-4 bg-white p-4 text-base ${sent ? "border-success-700 text-ink" : "border-danger-700 text-ink"}`}
    >
      {state.message}
    </div>
  );
}

function Field({
  id,
  label,
  error,
  help,
  ...input
}: React.InputHTMLAttributes<HTMLInputElement> & { id: string; label: string; error?: string; help?: string }) {
  const describedBy = [help ? `${id}-help` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      {help ? (
        <p id={`${id}-help`} className={helpClass}>
          {help}
        </p>
      ) : null}
      <input id={id} className={`${inputClass} mt-2`} aria-invalid={error ? true : undefined} aria-describedby={describedBy} {...input} />
      {error ? (
        <p id={`${id}-error`} className={errorClass}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(signInAction, initial);
  const id = useId();
  return (
    <form action={action} noValidate>
      <FormMessage state={state} />
      <input type="hidden" name="next" value={next} />
      <div className="space-y-5">
        <Field
          id={`${id}-email`}
          label="Email"
          name="email"
          type="email"
          autoComplete="username"
          inputMode="email"
          required
          defaultValue={state.email}
          error={state.fieldErrors?.email}
        />
        <Field
          id={`${id}-password`}
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          error={state.fieldErrors?.password}
        />
      </div>
      <button type="submit" className={`${primaryButton} mt-6 w-full`} disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
      <p className="mt-6 text-base">
        <Link href="/admin/forgot" className="text-copper-700 underline underline-offset-4">
          Forgot password?
        </Link>
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordResetAction, initial);
  const id = useId();
  if (state.status === "sent") return <FormMessage state={state} />;
  return (
    <form action={action} noValidate>
      <FormMessage state={state} />
      <Field
        id={`${id}-email`}
        label="Email"
        name="email"
        type="email"
        autoComplete="username"
        inputMode="email"
        required
        defaultValue={state.email}
        error={state.fieldErrors?.email}
      />
      <button type="submit" className={`${primaryButton} mt-6 w-full`} disabled={pending}>
        {pending ? "Sending…" : "Email me a reset link"}
      </button>
    </form>
  );
}

export function UpdatePasswordForm() {
  const [state, action, pending] = useActionState(updatePasswordAction, initial);
  const id = useId();
  return (
    <form action={action} noValidate>
      <FormMessage state={state} />
      <div className="space-y-5">
        <Field
          id={`${id}-password`}
          label="New password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={PASSWORD_MIN}
          required
          help={`At least ${PASSWORD_MIN} characters. A phrase of a few unrelated words is easy to remember and hard to guess.`}
          error={state.fieldErrors?.password}
        />
        <Field
          id={`${id}-confirm`}
          label="Type the new password again"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          error={state.fieldErrors?.confirm}
        />
      </div>
      <button type="submit" className={`${primaryButton} mt-6 w-full`} disabled={pending}>
        {pending ? "Saving…" : "Save new password"}
      </button>
    </form>
  );
}
