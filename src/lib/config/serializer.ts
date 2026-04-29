import { WorkflowConfig, WidgetConfig, WorkflowMetadata, WidgetMetadata } from './types';

// ── Helper Functions ──

function formatNumber(value: number, indentLevel: number): string {
  const indent = '  '.repeat(indentLevel);
  return `${indent}${value}`;
}

function formatString(value: string, indentLevel: number): string {
  const indent = '  '.repeat(indentLevel);
  const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
  return `${indent}"${escaped}"`;
}

function formatBoolean(value: boolean): string {
  return value ? 'true' : 'false';
}

function formatArray<T>(
  arr: T[],
  formatItem: (item: T, indentLevel: number) => string,
  indentLevel: number,
): string {
  if (arr.length === 0) {
    return '[]';
  }

  const indent = '  '.repeat(indentLevel);
  const nestedIndent = '  '.repeat(indentLevel + 1);
  const closingIndent = '  '.repeat(indentLevel);

  const items = arr.map((item) => `${nestedIndent}${formatItem(item, indentLevel + 1)}`).join(',\n');
  return `[\n${items}\n${closingIndent}]`;
}

function formatObject(
  obj: Record<string, unknown>,
  formatValue: (value: unknown, indentLevel: number) => string,
  indentLevel: number,
): string {
  const keys = Object.keys(obj);
  if (keys.length === 0) {
    return '{}';
  }

  const indent = '  '.repeat(indentLevel);
  const nestedIndent = '  '.repeat(indentLevel + 1);
  const closingIndent = '  '.repeat(indentLevel);

  const entries = keys
    .map((key) => `${nestedIndent}"${key}": ${formatValue(obj[key], indentLevel + 1)}`)
    .join(',\n');
  return `{\n${entries}\n${closingIndent}}`;
}

// ── Workflow Configuration Serializer ──

function formatWorkflowStepConfig(step: {
  id?: string;
  step: number;
  step_name: string;
  required_role: string;
  require_file: boolean;
  require_payment?: boolean;
  require_approval?: boolean;
  is_active?: boolean;
  is_fixed?: boolean;
  description?: string;
}, indentLevel: number): string {
  const indent = '  '.repeat(indentLevel);
  const nestedIndent = '  '.repeat(indentLevel + 1);
  const closingIndent = '  '.repeat(indentLevel);

  const parts: string[] = [];

  if (step.id !== undefined) {
    parts.push(`${nestedIndent}"id": "${step.id}"`);
  }

  parts.push(`${nestedIndent}"step": ${step.step}`);
  parts.push(`${nestedIndent}"step_name": "${step.step_name}"`);
  parts.push(`${nestedIndent}"required_role": "${step.required_role}"`);
  parts.push(`${nestedIndent}"require_file": ${formatBoolean(step.require_file)}`);

  if (step.require_payment !== undefined) {
    parts.push(`${nestedIndent}"require_payment": ${formatBoolean(step.require_payment)}`);
  }

  if (step.require_approval !== undefined) {
    parts.push(`${nestedIndent}"require_approval": ${formatBoolean(step.require_approval)}`);
  }

  if (step.is_active !== undefined) {
    parts.push(`${nestedIndent}"is_active": ${formatBoolean(step.is_active)}`);
  }

  if (step.is_fixed !== undefined) {
    parts.push(`${nestedIndent}"is_fixed": ${formatBoolean(step.is_fixed)}`);
  }

  if (step.description !== undefined) {
    parts.push(`${nestedIndent}"description": "${step.description}"`);
  }

  return `{\n${parts.join(',\n')}\n${closingIndent}}`;
}

function formatAutoAssignRule(rule: {
  id?: string;
  name: string;
  department_id?: number;
  skill_ids?: number[];
  workload_balance?: string;
  priority?: number;
}, indentLevel: number): string {
  const indent = '  '.repeat(indentLevel);
  const nestedIndent = '  '.repeat(indentLevel + 1);
  const closingIndent = '  '.repeat(indentLevel);

  const parts: string[] = [];

  if (rule.id !== undefined) {
    parts.push(`${nestedIndent}"id": "${rule.id}"`);
  }

  parts.push(`${nestedIndent}"name": "${rule.name}"`);

  if (rule.department_id !== undefined) {
    parts.push(`${nestedIndent}"department_id": ${rule.department_id}`);
  }

  if (rule.skill_ids !== undefined) {
    parts.push(`${nestedIndent}"skill_ids": [${rule.skill_ids.join(', ')}]`);
  }

  if (rule.workload_balance !== undefined) {
    parts.push(`${nestedIndent}"workload_balance": "${rule.workload_balance}"`);
  }

  if (rule.priority !== undefined) {
    parts.push(`${nestedIndent}"priority": ${rule.priority}`);
  }

  return `{\n${parts.join(',\n')}\n${closingIndent}}`;
}

function formatWorkflowMetadata(metadata: WorkflowMetadata, indentLevel: number): string {
  const indent = '  '.repeat(indentLevel);
  const nestedIndent = '  '.repeat(indentLevel + 1);
  const closingIndent = '  '.repeat(indentLevel);

  const parts: string[] = [];

  if (metadata.created_by !== undefined) {
    parts.push(`${nestedIndent}"created_by": "${metadata.created_by}"`);
  }

  if (metadata.created_at !== undefined) {
    parts.push(`${nestedIndent}"created_at": "${metadata.created_at}"`);
  }

  if (metadata.version !== undefined) {
    parts.push(`${nestedIndent}"version": "${metadata.version}"`);
  }

  return `{\n${parts.join(',\n')}\n${closingIndent}}`;
}

export function serializeWorkflowConfig(config: WorkflowConfig, options?: { pretty?: boolean }): string {
  const pretty = options?.pretty ?? true;

  if (!pretty) {
    return JSON.stringify(config);
  }

  const indentLevel = 0;
  const indent = '  '.repeat(indentLevel);
  const nestedIndent = '  '.repeat(indentLevel + 1);
  const closingIndent = '  '.repeat(indentLevel);

  const parts: string[] = [];

  parts.push(`${nestedIndent}"version": "${config.version}"`);
  parts.push(`${nestedIndent}"name": "${config.name}"`);

  if (config.description !== undefined) {
    parts.push(`${nestedIndent}"description": "${config.description}"`);
  }

  parts.push(`${nestedIndent}"steps_before_payment": ${formatArray(config.steps_before_payment, (step) => formatWorkflowStepConfig(step, 2), 1)}`);
  parts.push(`${nestedIndent}"processing_steps": ${formatArray(config.processing_steps, (step) => formatWorkflowStepConfig(step, 2), 1)}`);

  if (config.auto_assign_rules !== undefined && config.auto_assign_rules.length > 0) {
    parts.push(`${nestedIndent}"auto_assign_rules": ${formatArray(config.auto_assign_rules, (rule) => formatAutoAssignRule(rule, 2), 1)}`);
  }

  if (config.metadata !== undefined) {
    parts.push(`${nestedIndent}"metadata": ${formatWorkflowMetadata(config.metadata, 1)}`);
  }

  return `{\n${parts.join(',\n')}\n}`;
}

// ── Widget Configuration Serializer ──

function formatKPIConfig(config: {
  metric: string;
  groupBy: string;
  timeRange: string;
}, indentLevel: number): string {
  const indent = '  '.repeat(indentLevel);
  const nestedIndent = '  '.repeat(indentLevel + 1);
  const closingIndent = '  '.repeat(indentLevel);

  return `{\n${nestedIndent}"metric": "${config.metric}",\n${nestedIndent}"groupBy": "${config.groupBy}",\n${nestedIndent}"timeRange": "${config.timeRange}"\n${closingIndent}}`;
}

function formatChartConfig(config: {
  type: string;
  metrics: string[];
  timeRange: string;
  groupBy?: string;
}, indentLevel: number): string {
  const indent = '  '.repeat(indentLevel);
  const nestedIndent = '  '.repeat(indentLevel + 1);
  const closingIndent = '  '.repeat(indentLevel);

  const parts: string[] = [];
  parts.push(`${nestedIndent}"type": "${config.type}"`);
  parts.push(`${nestedIndent}"metrics": [${config.metrics.map((m) => `"${m}"`).join(', ')}]`);
  parts.push(`${nestedIndent}"timeRange": "${config.timeRange}"`);

  if (config.groupBy !== undefined) {
    parts.push(`${nestedIndent}"groupBy": "${config.groupBy}"`);
  }

  return `{\n${parts.join(',\n')}\n${closingIndent}}`;
}

function formatForecastConfig(config: {
  metric: string;
  historicalPeriod: number;
  forecastPeriod: number;
  confidenceInterval: number;
}, indentLevel: number): string {
  const indent = '  '.repeat(indentLevel);
  const nestedIndent = '  '.repeat(indentLevel + 1);
  const closingIndent = '  '.repeat(indentLevel);

  return `{\n${nestedIndent}"metric": "${config.metric}",\n${nestedIndent}"historicalPeriod": ${config.historicalPeriod},\n${nestedIndent}"forecastPeriod": ${config.forecastPeriod},\n${nestedIndent}"confidenceInterval": ${config.confidenceInterval}\n${closingIndent}}`;
}

function formatCustomConfig(config: Record<string, unknown>, indentLevel: number): string {
  return formatObject(config, (value) => formatValue(value, indentLevel), indentLevel);
}

function formatValue(value: unknown, indentLevel: number): string {
  if (value === null) {
    return 'null';
  }

  switch (typeof value) {
    case 'string':
      return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t')}"`;
    case 'number':
      return `${value}`;
    case 'boolean':
      return formatBoolean(value);
    case 'object':
      if (Array.isArray(value)) {
        return formatArray(value, (item) => formatValue(item, indentLevel + 1), indentLevel);
      }
      return formatObject(value as Record<string, unknown>, (v) => formatValue(v, indentLevel + 1), indentLevel);
    default:
      return 'null';
  }
}

function formatDashboardWidget(widget: {
  id: string;
  type: string;
  title: string;
  config: unknown;
}, indentLevel: number): string {
  const indent = '  '.repeat(indentLevel);
  const nestedIndent = '  '.repeat(indentLevel + 1);
  const closingIndent = '  '.repeat(indentLevel);

  const parts: string[] = [];
  parts.push(`${nestedIndent}"id": "${widget.id}"`);
  parts.push(`${nestedIndent}"type": "${widget.type}"`);
  parts.push(`${nestedIndent}"title": "${widget.title}"`);

  // Format config based on widget type
  if (widget.type === 'kpi') {
    parts.push(`${nestedIndent}"config": ${formatKPIConfig(widget.config as any, indentLevel + 1)}`);
  } else if (widget.type === 'chart') {
    parts.push(`${nestedIndent}"config": ${formatChartConfig(widget.config as any, indentLevel + 1)}`);
  } else if (widget.type === 'forecast') {
    parts.push(`${nestedIndent}"config": ${formatForecastConfig(widget.config as any, indentLevel + 1)}`);
  } else {
    parts.push(`${nestedIndent}"config": ${formatCustomConfig(widget.config as Record<string, unknown>, indentLevel + 1)}`);
  }

  return `{\n${parts.join(',\n')}\n${closingIndent}}`;
}

function formatWidgetLayout(layout: {
  grid_columns: number;
  grid_rows: number;
  gap: number;
}, indentLevel: number): string {
  const indent = '  '.repeat(indentLevel);
  const nestedIndent = '  '.repeat(indentLevel + 1);
  const closingIndent = '  '.repeat(indentLevel);

  return `{\n${nestedIndent}"grid_columns": ${layout.grid_columns},\n${nestedIndent}"grid_rows": ${layout.grid_rows},\n${nestedIndent}"gap": ${layout.gap}\n${closingIndent}}`;
}

function formatWidgetMetadata(metadata: WidgetMetadata, indentLevel: number): string {
  const indent = '  '.repeat(indentLevel);
  const nestedIndent = '  '.repeat(indentLevel + 1);
  const closingIndent = '  '.repeat(indentLevel);

  const parts: string[] = [];

  if (metadata.created_by !== undefined) {
    parts.push(`${nestedIndent}"created_by": "${metadata.created_by}"`);
  }

  if (metadata.created_at !== undefined) {
    parts.push(`${nestedIndent}"created_at": "${metadata.created_at}"`);
  }

  return `{\n${parts.join(',\n')}\n${closingIndent}}`;
}

export function serializeWidgetConfig(config: WidgetConfig, options?: { pretty?: boolean }): string {
  const pretty = options?.pretty ?? true;

  if (!pretty) {
    return JSON.stringify(config);
  }

  const indentLevel = 0;
  const indent = '  '.repeat(indentLevel);
  const nestedIndent = '  '.repeat(indentLevel + 1);
  const closingIndent = '  '.repeat(indentLevel);

  const parts: string[] = [];

  parts.push(`${nestedIndent}"version": "${config.version}"`);
  parts.push(`${nestedIndent}"widgets": ${formatArray(config.widgets, (widget) => formatDashboardWidget(widget, 1), 1)}`);

  if (config.layout !== undefined) {
    parts.push(`${nestedIndent}"layout": ${formatWidgetLayout(config.layout, 1)}`);
  }

  if (config.metadata !== undefined) {
    parts.push(`${nestedIndent}"metadata": ${formatWidgetMetadata(config.metadata, 1)}`);
  }

  return `{\n${parts.join(',\n')}\n}`;
}
