import type { InputHTMLAttributes } from "react";
import { ErrorMessage, Input, Label } from "@/components/atoms";
type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: string };
export function FormField({ id, label, hint, error, ...inputProps }: FormFieldProps) { return <div className="field-group"><Label htmlFor={id}>{label}{hint ? <span> ({hint})</span> : null}</Label><Input id={id} {...inputProps} />{error ? <ErrorMessage>{error}</ErrorMessage> : null}</div>; }
