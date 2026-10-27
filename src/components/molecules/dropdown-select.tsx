"use client";

import { Select, type SelectProps } from "@mui/material";

type DropdownSelectProps = Omit<SelectProps<string>, "native" | "multiple"> & {
  "aria-label": string;
};

/** Shared single-choice menu for toolbars and compact forms. */
export function DropdownSelect({ children, className = "", "aria-label": label, ...props }: DropdownSelectProps) {
  return <Select<string>
    {...props}
    displayEmpty
    className={`dropdown-select ${className}`}
    inputProps={{ "aria-label": label }}
    MenuProps={{
      slotProps: {
        paper: { className: "dropdown-select-menu" },
        list: { "aria-label": label },
      },
      anchorOrigin: { vertical: "bottom", horizontal: "left" },
      transformOrigin: { vertical: "top", horizontal: "left" },
    }}
  >{children}</Select>;
}
