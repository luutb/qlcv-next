import type { Settings, SettingsField } from "./work-board.types";

export const STORAGE_KEY = "work-board-settings";

export const DEFAULT_SETTINGS: Settings = {
  density: "comfortable",
  fields: {
    project: true,
    assignee: true,
    labels: true,
    due: true,
    status: true,
    created: false,
  },
};

export const SETTINGS_FIELDS: SettingsField[] = ["project", "assignee", "labels", "due", "status", "created"];

export function readSettings(): Settings {
  if (typeof window === "undefined") {
    return DEFAULT_SETTINGS;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      density: parsed.density === "compact" ? "compact" : "comfortable",
      fields: {
        ...DEFAULT_SETTINGS.fields,
        ...(parsed.fields ?? {}),
      },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function persistSettings(settings: Settings) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }
}

export function fieldLabel(field: SettingsField) {
  const labels: Record<SettingsField, string> = {
    project: "Project",
    assignee: "Assignee",
    labels: "Labels",
    due: "Due date",
    status: "Status",
    created: "Created date",
  };

  return labels[field];
}

export function applyBodySettings(settings: Settings) {
  document.body.classList.toggle("od-workboard--density-compact", settings.density === "compact");
  applyFieldVisibility(settings.fields);
}

export function applyFieldVisibility(fields: Record<SettingsField, boolean>) {
  SETTINGS_FIELDS.forEach((field) => {
    document.body.classList.toggle(`od-workboard--hide-${field}`, !fields[field]);
  });
}
