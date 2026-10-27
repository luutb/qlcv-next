import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import ts from "typescript";

const featureSource = await readFile(new URL("../../src/features/platform/model/plan-features.ts", import.meta.url), "utf8");
const featureCode = ts.transpileModule(featureSource, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const featureUrl = `data:text/javascript;base64,${Buffer.from(featureCode).toString("base64")}`;
const source = (await readFile(new URL("../../src/features/platform/model/plan-draft.ts", import.meta.url), "utf8")).replace("./plan-features", featureUrl);
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { planDraft, validatePlanDraft } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const draft = { ...planDraft(), code: "TEAM", name: "Nhóm pháp lý" };

test("new plans preserve unset pricing and limits; zero is an explicit limit", () => {
  const { input } = validatePlanDraft(draft);
  assert.equal(input.price_amount, null);
  assert.equal(input.currency, null);
  assert.deepEqual(input.limits, { members: null, projects: null, storage_bytes: null });
  const zero = validatePlanDraft({ ...draft, priced: true, price: "0", members: "0", storage_gb: "0" }).input;
  assert.equal(zero.price_amount, "0");
  assert.equal(zero.currency, "VND");
  assert.equal(zero.limits.members, 0);
  assert.equal(zero.limits.storage_bytes, 0);
});

test("plan validation rejects unsafe amounts and fractional member limits", () => {
  for (const price of ["-1", "1e9", "01", "1,000", "1.001", "99999999999999999"]) {
    assert.ok(validatePlanDraft({ ...draft, priced: true, price }).errors.price);
  }
  for (const members of ["-1", "1.5", "2147483648", "1e3"]) {
    assert.ok(validatePlanDraft({ ...draft, members }).errors.members);
  }
  assert.ok(validatePlanDraft({ ...draft, storage_gb: "Infinity" }).errors.storage_gb);
});

test("editing retains plan pricing, activation and binary storage units", () => {
  const plan = { features: ["projects", "tasks"], code: "TEAM", name: "Nhóm", description: "Mô tả", is_active: false, price_amount: "250000.00", currency: "VND", billing_interval: "YEARLY", limits: { members: 12, projects: 30, storage_bytes: 1.5 * 1024 ** 3 } };
  assert.deepEqual(validatePlanDraft(planDraft(plan)).input, plan);
});

test("suggested plans submit valid unset pricing and preserve storage bytes on edit", async () => {
  const presetsSource = await readFile(new URL("../../src/features/platform/model/plan-presets.ts", import.meta.url), "utf8");
  const presetsCompiled = ts.transpileModule(presetsSource, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  const { planPresets } = await import(`data:text/javascript;base64,${Buffer.from(presetsCompiled).toString("base64")}`);
  for (const preset of planPresets) {
    const result = validatePlanDraft({ ...planDraft(), ...preset });
    assert.deepEqual(result.errors, {});
    assert.equal(result.input.price_amount, null);
    assert.equal(result.input.limits.storage_bytes, Number(preset.storage_gb) * 1024 ** 3);
    assert.deepEqual(validatePlanDraft(planDraft(result.input)).input, result.input);
  }
});


test("plan feature choices survive edits and reject unknown or duplicate features", () => {
 const input = validatePlanDraft({ ...draft, features: ["documents", "finance"] }).input;
 assert.deepEqual(input.features, ["documents", "finance"]);
 assert.deepEqual(validatePlanDraft(planDraft(input)).input, input);
 assert.ok(validatePlanDraft({ ...draft, features: ["platform.access"] }).errors.features);
 assert.ok(validatePlanDraft({ ...draft, features: ["tasks", "tasks"] }).errors.features);
});
