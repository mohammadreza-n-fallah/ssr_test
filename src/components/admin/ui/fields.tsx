"use client";

import { useId } from "react";
import { ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100 placeholder:text-gray-400 disabled:bg-gray-50";

export function Field({
  label,
  hint,
  required,
  children,
  className,
}: {
  label?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      {label && (
        <span className="mb-1.5 flex items-center gap-1 text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500">*</span>}
        </span>
      )}
      {children}
      {hint && <span className="mt-1 block text-xs text-gray-400">{hint}</span>}
    </label>
  );
}

interface BaseProps {
  label?: string;
  hint?: string;
  required?: boolean;
  className?: string;
}

export function TextInput({
  label,
  hint,
  required,
  className,
  ltr,
  ...rest
}: BaseProps & React.InputHTMLAttributes<HTMLInputElement> & { ltr?: boolean }) {
  return (
    <Field label={label} hint={hint} required={required} className={className}>
      <input {...rest} className={cn(inputClass, ltr && "ltr text-left")} />
    </Field>
  );
}

export function NumberInput(
  props: BaseProps & React.InputHTMLAttributes<HTMLInputElement>
) {
  return <TextInput type="number" ltr {...props} />;
}

export function TextArea({
  label,
  hint,
  required,
  className,
  rows = 4,
  ...rest
}: BaseProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Field label={label} hint={hint} required={required} className={className}>
      <textarea {...rest} rows={rows} className={cn(inputClass, "resize-y")} />
    </Field>
  );
}

export interface Option {
  value: string | number;
  label: string;
}

export function SelectInput({
  label,
  hint,
  required,
  className,
  options,
  placeholder,
  value,
  onChange,
  ...rest
}: BaseProps & {
  options: Option[];
  placeholder?: string;
  value: string | number | undefined | null;
  onChange: (v: string) => void;
} & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "value" | "onChange">) {
  return (
    <Field label={label} hint={hint} required={required} className={className}>
      <select
        {...rest}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={cn(inputClass, "cursor-pointer")}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function Switch({
  label,
  checked,
  onChange,
  hint,
}: {
  label?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <div>
        {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
        {hint && <p className="text-xs text-gray-400">{hint}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          checked ? "bg-[#f97316]" : "bg-gray-300"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
            checked ? "left-0.5" : "left-[22px]"
          )}
        />
      </button>
    </div>
  );
}

/** File/image input with a small preview of the current or newly-picked image. */
export function ImageUpload({
  label,
  value,
  current,
  onChange,
}: {
  label?: string;
  value: File | null;
  current?: string | null;
  onChange: (f: File | null) => void;
}) {
  const id = useId();
  const preview = value ? URL.createObjectURL(value) : current || null;
  return (
    <Field label={label}>
      <div className="flex items-center gap-3">
        <label
          htmlFor={id}
          className="flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50 text-gray-400 hover:border-[#f97316]"
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus className="h-5 w-5" />
          )}
        </label>
        <div className="text-xs text-gray-500">
          <input
            id={id}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onChange(e.target.files?.[0] ?? null)}
          />
          <label htmlFor={id} className="cursor-pointer text-[#1e3a8a] hover:underline">
            انتخاب تصویر
          </label>
          {value && <p className="mt-1 ltr text-left">{value.name}</p>}
        </div>
      </div>
    </Field>
  );
}
