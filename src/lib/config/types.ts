import { Role, WorkflowStepConfig } from '@/types';

// ── Workflow Configuration ──

export interface WorkflowStepConfigInternal {
  id?: string;
  step: number;
  step_name: string;
  required_role: Role;
  require_file: boolean;
  require_payment?: boolean;
  require_approval?: boolean;
  is_active?: boolean;
  is_fixed?: boolean;
  description?: string;
}

export interface AutoAssignRule {
  id?: string;
  name: string;
  department_id?: number;
  skill_ids?: number[];
  workload_balance?: 'round_robin' | 'least_busy' | 'most_available';
  priority?: number;
}

export interface WorkflowMetadata {
  created_by?: string;
  created_at?: string;
  version?: string;
}

export interface WorkflowConfig {
  version: string;
  name: string;
  description?: string;
  steps_before_payment: WorkflowStepConfigInternal[];
  processing_steps: WorkflowStepConfigInternal[];
  auto_assign_rules?: AutoAssignRule[];
  metadata?: WorkflowMetadata;
}

// ── Widget Configuration ──

export type WidgetType = 'kpi' | 'chart' | 'forecast' | 'custom';

export interface KPIConfig {
  metric: 'tasks_completed' | 'tasks_pending' | 'revenue' | 'avg_completion_time';
  groupBy: 'department' | 'user' | 'none';
  timeRange: 'day' | 'week' | 'month' | 'year';
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie';
  metrics: string[];
  timeRange: 'day' | 'week' | 'month' | 'year';
  groupBy?: string;
}

export interface ForecastConfig {
  metric: 'revenue' | 'tasks';
  historicalPeriod: number;
  forecastPeriod: number;
  confidenceInterval: number;
}

export interface WidgetConfigBase {
  id: string;
  type: WidgetType;
  title: string;
}

export interface KPIWidgetConfig extends WidgetConfigBase {
  type: 'kpi';
  config: KPIConfig;
}

export interface ChartWidgetConfig extends WidgetConfigBase {
  type: 'chart';
  config: ChartConfig;
}

export interface ForecastWidgetConfig extends WidgetConfigBase {
  type: 'forecast';
  config: ForecastConfig;
}

export interface CustomWidgetConfig extends WidgetConfigBase {
  type: 'custom';
  config: Record<string, unknown>;
}

export type DashboardWidget = KPIWidgetConfig | ChartWidgetConfig | ForecastWidgetConfig | CustomWidgetConfig;

export interface WidgetLayout {
  grid_columns: number;
  grid_rows: number;
  gap: number;
}

export interface WidgetMetadata {
  created_by?: string;
  created_at?: string;
}

export interface WidgetConfig {
  version: string;
  widgets: DashboardWidget[];
  layout?: WidgetLayout;
  metadata?: WidgetMetadata;
}

// ── Parse Result Types ──

export type ParseErrorCode =
  | 'INVALID_JSON'
  | 'MISSING_REQUIRED_FIELD'
  | 'INVALID_FIELD_TYPE'
  | 'INVALID_ENUM_VALUE'
  | 'INVALID_VERSION'
  | 'SCHEMA_VALIDATION_FAILED'
  | 'DEPENDENCY_RESOLUTION_FAILED';

export interface ParseErrorDetails {
  field?: string;
  expected?: string;
  actual?: string;
  validValues?: string[];
}

export interface ParseError {
  code: ParseErrorCode;
  message: string;
  path?: string;
  details?: ParseErrorDetails;
}

export interface ParseResult<T> {
  success: boolean;
  data?: T;
  error?: ParseError;
}
