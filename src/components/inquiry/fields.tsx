import type { ReactNode } from "react";

/**
 * Presentational form primitives for the inquiry form. Labels sit above
 * fields, hints and errors are linked with aria-describedby, and every
 * control has a 44px+ touch target.
 */

export const inputClasses = [
  "block w-full min-h-12 rounded-sm border bg-limestone-50 px-3 py-2.5 text-base text-ink",
  "placeholder:text-ink-soft transition-colors",
  "hover:border-midnight-700 focus-visible:border-midnight-900",
].join(" ");

function borderFor(error?: string) {
  return error ? "border-danger-700 border-2" : "border-midnight-900/50";
}

export function describedBy(...ids: Array<string | false | null | undefined>): string | undefined {
  const list = ids.filter(Boolean).join(" ");
  return list || undefined;
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-2 flex gap-2 text-sm font-semibold text-danger-700">
      <span aria-hidden="true">!</span>
      <span>
        <span className="sr-only">Error: </span>
        {message}
      </span>
    </p>
  );
}

export function Hint({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="mt-1 text-sm text-ink-muted">
      {children}
    </p>
  );
}

export function RequiredMark({ required }: { required: boolean }) {
  return (
    <span className="ml-1 text-sm font-normal text-ink-muted">{required ? "(required)" : "(optional)"}</span>
  );
}

interface TextFieldProps {
  id: string;
  name: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  defaultValue?: string;
  type?: "text" | "email" | "tel";
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel";
  maxLength?: number;
  spellCheck?: boolean;
  autoCapitalize?: string;
}

export function TextField({
  id,
  name,
  label,
  hint,
  error,
  required = false,
  defaultValue,
  type = "text",
  autoComplete,
  inputMode,
  maxLength,
  spellCheck,
  autoCapitalize,
}: TextFieldProps) {
  const hintId = hint ? `${id}-hint` : null;
  const errorId = error ? `${id}-error` : null;
  return (
    <div>
      <label htmlFor={id} className="block font-semibold text-ink">
        {label}
        <RequiredMark required={required} />
      </label>
      {hint ? <Hint id={`${id}-hint`}>{hint}</Hint> : null}
      <FieldError id={`${id}-error`} message={error} />
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(errorId, hintId)}
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        spellCheck={spellCheck}
        autoCapitalize={autoCapitalize}
        className={`mt-2 ${inputClasses} ${borderFor(error)}`}
      />
    </div>
  );
}

interface TextAreaFieldProps {
  id: string;
  name: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  defaultValue?: string;
  maxLength?: number;
  rows?: number;
}

export function TextAreaField({ id, name, label, hint, error, required = false, defaultValue, maxLength, rows = 3 }: TextAreaFieldProps) {
  const hintId = hint ? `${id}-hint` : null;
  const errorId = error ? `${id}-error` : null;
  return (
    <div>
      <label htmlFor={id} className="block font-semibold text-ink">
        {label}
        <RequiredMark required={required} />
      </label>
      {hint ? <Hint id={`${id}-hint`}>{hint}</Hint> : null}
      <FieldError id={`${id}-error`} message={error} />
      <textarea
        id={id}
        name={name}
        rows={rows}
        required={required}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(errorId, hintId)}
        defaultValue={defaultValue}
        maxLength={maxLength}
        className={`mt-2 ${inputClasses} ${borderFor(error)}`}
      />
    </div>
  );
}

export interface RadioOption<T extends string> {
  value: T;
  label: string;
  hint?: string;
}

interface RadioGroupProps<T extends string> {
  /** Prefix for option ids: option id = `${idPrefix}-${value}`. */
  idPrefix: string;
  name: string;
  legend: ReactNode;
  hint?: ReactNode;
  error?: string;
  options: ReadonlyArray<RadioOption<T>>;
  value: T | "";
  onChange: (value: T) => void;
  required?: boolean;
  layout?: "stack" | "inline";
}

export function RadioGroup<T extends string>({
  idPrefix,
  name,
  legend,
  hint,
  error,
  options,
  value,
  onChange,
  required = false,
  layout = "stack",
}: RadioGroupProps<T>) {
  const hintId = hint ? `${idPrefix}-hint` : null;
  const errorId = error ? `${idPrefix}-error` : null;
  return (
    <fieldset aria-describedby={describedBy(errorId, hintId)} aria-invalid={error ? true : undefined}>
      <legend className="font-semibold text-ink">
        {legend}
        <RequiredMark required={required} />
      </legend>
      {hint ? <Hint id={`${idPrefix}-hint`}>{hint}</Hint> : null}
      <FieldError id={`${idPrefix}-error`} message={error} />
      <div className={layout === "inline" ? "mt-2 flex flex-wrap gap-2" : "mt-2 grid gap-2"}>
        {options.map((opt, i) => {
          const id = `${idPrefix}-${opt.value}`;
          const checked = value === opt.value;
          return (
            <label
              key={opt.value}
              htmlFor={id}
              className={[
                "flex min-h-12 cursor-pointer items-start gap-3 rounded-sm border px-3 py-3 transition-colors",
                checked
                  ? "border-midnight-900 bg-midnight-100/60"
                  : error
                    ? "border-danger-700 bg-limestone-50 hover:border-midnight-700"
                    : "border-midnight-900/30 bg-limestone-50 hover:border-midnight-700",
                layout === "inline" ? "grow basis-36" : "",
              ].join(" ")}
            >
              <input
                id={id}
                type="radio"
                name={name}
                value={opt.value}
                checked={checked}
                onChange={() => onChange(opt.value)}
                required={required && i === 0}
                className="mt-0.5 size-5 shrink-0 accent-copper-700"
              />
              <span className="min-w-0">
                <span className="block leading-snug">{opt.label}</span>
                {opt.hint ? <span className="mt-0.5 block text-sm text-ink-muted">{opt.hint}</span> : null}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
