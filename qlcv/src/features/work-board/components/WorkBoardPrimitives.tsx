import type { ReactNode } from "react";
import type { WorkStatus } from "../model/work-board.types";

export function Field({
  label,
  children,
  required,
  error,
  className,
}: {
  label: string;
  children: ReactNode;
  required?: boolean;
  error?: string;
  className?: string;
}) {
  return (
    <div className={`od-workboard__field ${className ?? ""} ${error ? "has-error" : ""}`}>
      <label>
        {label}
        {required ? " *" : ""}
      </label>
      {children}
      {error ? <span className="od-workboard__field-error">{error}</span> : null}
    </div>
  );
}

export function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="od-workboard__popover-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label>{label}</label>
      <p>{value}</p>
    </div>
  );
}

export function StatusChip({ status }: { status: WorkStatus }) {
  return <span className={`od-workboard__chip od-workboard__chip--status-${status.toLowerCase()}`}>{status}</span>;
}
