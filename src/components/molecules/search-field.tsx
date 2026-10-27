import type { InputHTMLAttributes } from "react";
import { Icon } from "@/components/atoms";
type SearchFieldProps = InputHTMLAttributes<HTMLInputElement> & { className?: string };
export function SearchField({ placeholder, className = "", ...props }: SearchFieldProps) { return <label className={`workhub-search ${className}`}><Icon name="search" size={19} /><span className="sr-only">Tìm kiếm</span><input {...props} type="search" placeholder={placeholder} /></label>; }
