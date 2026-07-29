import { SETTINGS_FIELDS, fieldLabel } from "../model/work-board.settings";
import type { Settings, SettingsField } from "../model/work-board.types";
import { CloseIcon } from "./WorkBoardIcons";
import { Field } from "./WorkBoardPrimitives";

export function DisplaySettingsSheet({
  open,
  settings,
  onDensityChange,
  onToggleField,
  onClose,
  onReset,
  onSave,
}: {
  open: boolean;
  settings: Settings;
  onDensityChange: (density: Settings["density"]) => void;
  onToggleField: (field: SettingsField, checked: boolean) => void;
  onClose: () => void;
  onReset: () => void;
  onSave: () => void;
}) {
  return (
    <>
      {open ? <div className="od-workboard__backdrop" onClick={onClose} aria-hidden="true" /> : null}
      <section className={`od-workboard__sheet ${open ? "is-open" : ""}`} aria-hidden={!open}>
        <div className="od-workboard__sheet-head">
          <h2>Display settings</h2>
          <button className="od-workboard__icon-button" type="button" onClick={onClose} aria-label="Đóng settings">
            <CloseIcon />
          </button>
        </div>
        <div className="od-workboard__sheet-body">
          <Field label="Density">
            <select value={settings.density} onChange={(event) => onDensityChange(event.target.value as Settings["density"])}>
              <option value="comfortable">Comfortable</option>
              <option value="compact">Compact</option>
            </select>
          </Field>
          <Field label="Card fields">
            <div className="od-workboard__check-list">
              {SETTINGS_FIELDS.map((field) => (
                <label key={field}>
                  {fieldLabel(field)}
                  <input
                    type="checkbox"
                    checked={settings.fields[field]}
                    onChange={(event) => onToggleField(field, event.target.checked)}
                  />
                </label>
              ))}
            </div>
          </Field>
        </div>
        <div className="od-workboard__sheet-foot">
          <button className="od-workboard__button" type="button" onClick={onReset}>
            Reset
          </button>
          <button className="od-workboard__button od-workboard__button--primary" type="button" onClick={onSave}>
            Save
          </button>
        </div>
      </section>
    </>
  );
}
