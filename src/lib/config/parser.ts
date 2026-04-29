import {
  WorkflowConfig,
  WidgetConfig,
  ParseResult,
  ParseError,
  ParseErrorCode,
  ParseErrorDetails,
  WorkflowStepConfigInternal,
  AutoAssignRule,
  DashboardWidget,
  KPIConfig,
  ChartConfig,
  ForecastConfig,
  WorkflowMetadata,
  WidgetLayout,
} from './types';

// ── Helper Functions ──

function createError(
  code: ParseErrorCode,
  message: string,
  path?: string,
  details?: ParseErrorDetails,
): ParseError {
  return { code, message, path, details };
}

function validateString(value: unknown, fieldName: string, path: string, required: boolean = true): string | ParseError | undefined {
  if (value === undefined) {
    if (required) {
      return createError(
        'MISSING_REQUIRED_FIELD',
        `${fieldName} is required`,
        path,
        { field: fieldName, expected: 'string' },
      );
    }
    return undefined;
  }
  if (typeof value !== 'string') {
    return createError(
      'INVALID_FIELD_TYPE',
      `${fieldName} must be a string`,
      path,
      { field: fieldName, expected: 'string', actual: typeof value },
    );
  }
  return value;
}

function validateNumber(value: unknown, fieldName: string, path: string, required: boolean = true): number | ParseError | undefined {
  if (value === undefined) {
    if (required) {
      return createError(
        'MISSING_REQUIRED_FIELD',
        `${fieldName} is required`,
        path,
        { field: fieldName, expected: 'number' },
      );
    }
    return undefined;
  }
  if (typeof value !== 'number') {
    return createError(
      'INVALID_FIELD_TYPE',
      `${fieldName} must be a number`,
      path,
      { field: fieldName, expected: 'number', actual: typeof value },
    );
  }
  return value;
}

function validateArray(value: unknown, fieldName: string, path: string, required: boolean = true): unknown[] | ParseError | undefined {
  if (value === undefined) {
    if (required) {
      return createError(
        'MISSING_REQUIRED_FIELD',
        `${fieldName} is required`,
        path,
        { field: fieldName, expected: 'array' },
      );
    }
    return undefined;
  }
  if (!Array.isArray(value)) {
    return createError(
      'INVALID_FIELD_TYPE',
      `${fieldName} must be an array`,
      path,
      { field: fieldName, expected: 'array', actual: typeof value },
    );
  }
  return value;
}

function validateEnum<T extends string>(
  value: unknown,
  validValues: readonly T[],
  fieldName: string,
  path: string,
): T | ParseError | undefined {
  if (!validValues.includes(value as T)) {
    return createError(
      'INVALID_ENUM_VALUE',
      `${fieldName} must be one of: ${validValues.join(', ')}`,
      path,
      { field: fieldName, validValues: Array.from(validValues) },
    );
  }
  return value as T;
}

// ── Workflow Configuration Parser ──

function parseWorkflowStepConfig(
  step: unknown,
  index: number,
  path: string,
): { config: Partial<WorkflowStepConfigInternal>; error?: ParseError } {
  if (typeof step !== 'object' || step === null) {
    return {
      config: {},
      error: createError(
        'INVALID_FIELD_TYPE',
        `Step at index ${index} must be an object`,
        `${path}[${index}]`,
        { field: 'step', expected: 'object', actual: typeof step },
      ),
    };
  }

  const stepObj = step as Record<string, unknown>;
  const result: Partial<WorkflowStepConfigInternal> = {};
  let error: ParseError | undefined;

  // Validate required fields
  const stepNumResult = validateNumber(stepObj.step, 'step', `${path}[${index}].step`);
  if (stepNumResult instanceof Error || (typeof stepNumResult !== 'number' && stepNumResult !== undefined)) {
    error = stepNumResult as ParseError;
  } else if (stepNumResult !== undefined) {
    result.step = stepNumResult;
  }

  const stepNameResult = validateString(stepObj.step_name, 'step_name', `${path}[${index}].step_name`);
  if (stepNameResult instanceof Error || (typeof stepNameResult !== 'string' && stepNameResult !== undefined)) {
    error = error || (stepNameResult as ParseError);
  } else if (stepNameResult !== undefined) {
    result.step_name = stepNameResult;
  }

  // Validate required_role enum
  const validRoles = ['admin', 'manager', 'staff', 'accountant'] as const;
  const roleResult = validateEnum(stepObj.required_role, validRoles, 'required_role', `${path}[${index}].required_role`);
  if (roleResult instanceof Error || (typeof roleResult !== 'string' && roleResult !== undefined)) {
    error = error || (roleResult as ParseError);
  } else if (roleResult !== undefined) {
    result.required_role = roleResult;
  }

  // Validate optional boolean fields
  if (stepObj.require_file !== undefined) {
    if (typeof stepObj.require_file !== 'boolean') {
      error = error || createError(
        'INVALID_FIELD_TYPE',
        'require_file must be a boolean',
        `${path}[${index}].require_file`,
        { field: 'require_file', expected: 'boolean', actual: typeof stepObj.require_file },
      );
    } else {
      result.require_file = stepObj.require_file;
    }
  }

  if (stepObj.require_approval !== undefined) {
    if (typeof stepObj.require_approval !== 'boolean') {
      error = error || createError(
        'INVALID_FIELD_TYPE',
        'require_approval must be a boolean',
        `${path}[${index}].require_approval`,
        { field: 'require_approval', expected: 'boolean', actual: typeof stepObj.require_approval },
      );
    } else {
      result.require_approval = stepObj.require_approval;
    }
  }

  if (stepObj.is_active !== undefined) {
    if (typeof stepObj.is_active !== 'boolean') {
      error = error || createError(
        'INVALID_FIELD_TYPE',
        'is_active must be a boolean',
        `${path}[${index}].is_active`,
        { field: 'is_active', expected: 'boolean', actual: typeof stepObj.is_active },
      );
    } else {
      result.is_active = stepObj.is_active;
    }
  }

  if (stepObj.is_fixed !== undefined) {
    if (typeof stepObj.is_fixed !== 'boolean') {
      error = error || createError(
        'INVALID_FIELD_TYPE',
        'is_fixed must be a boolean',
        `${path}[${index}].is_fixed`,
        { field: 'is_fixed', expected: 'boolean', actual: typeof stepObj.is_fixed },
      );
    } else {
      result.is_fixed = stepObj.is_fixed;
    }
  }

  if (stepObj.description !== undefined) {
    const descResult = validateString(stepObj.description, 'description', `${path}[${index}].description`, false);
    if (descResult instanceof Error || (typeof descResult !== 'string' && descResult !== undefined)) {
      error = error || (descResult as ParseError);
    } else if (descResult !== undefined) {
      result.description = descResult;
    }
  }

  if (stepObj.id !== undefined) {
    const idResult = validateString(stepObj.id, 'id', `${path}[${index}].id`, false);
    if (idResult instanceof Error || (typeof idResult !== 'string' && idResult !== undefined)) {
      error = error || (idResult as ParseError);
    } else if (idResult !== undefined) {
      result.id = idResult;
    }
  }

  return { config: result, error };
}

function parseAutoAssignRule(
  rule: unknown,
  index: number,
  path: string,
): { rule: Partial<AutoAssignRule>; error?: ParseError } {
  if (typeof rule !== 'object' || rule === null) {
    return {
      rule: {},
      error: createError(
        'INVALID_FIELD_TYPE',
        `Auto-assign rule at index ${index} must be an object`,
        `${path}[${index}]`,
        { field: 'rule', expected: 'object', actual: typeof rule },
      ),
    };
  }

  const ruleObj = rule as Record<string, unknown>;
  const result: Partial<AutoAssignRule> = {};
  let error: ParseError | undefined;

  const nameResult = validateString(ruleObj.name, 'name', `${path}[${index}].name`);
  if (nameResult instanceof Error || (typeof nameResult !== 'string' && nameResult !== undefined)) {
    error = nameResult as ParseError;
  } else if (nameResult !== undefined) {
    result.name = nameResult;
  }

  if (ruleObj.department_id !== undefined) {
    const deptResult = validateNumber(ruleObj.department_id, 'department_id', `${path}[${index}].department_id`, false);
    if (deptResult instanceof Error || (typeof deptResult !== 'number' && deptResult !== undefined)) {
      error = error || (deptResult as ParseError);
    } else if (deptResult !== undefined) {
      result.department_id = deptResult;
    }
  }

  if (ruleObj.skill_ids !== undefined) {
    const skillsResult = validateArray(ruleObj.skill_ids, 'skill_ids', `${path}[${index}].skill_ids`, false);
    if (skillsResult instanceof Error || (typeof skillsResult !== 'object' && skillsResult !== undefined)) {
      error = error || (skillsResult as ParseError);
    } else if (skillsResult !== undefined) {
      const skillIds = skillsResult as number[];
      if (skillIds.some((id) => typeof id !== 'number')) {
        error = error || createError(
          'INVALID_FIELD_TYPE',
          'skill_ids must be an array of numbers',
          `${path}[${index}].skill_ids`,
          { field: 'skill_ids', expected: 'number[]', actual: 'array with non-number values' },
        );
      } else {
        result.skill_ids = skillIds;
      }
    }
  }

  if (ruleObj.workload_balance !== undefined) {
    const validBalances = ['round_robin', 'least_busy', 'most_available'] as const;
    const balanceResult = validateEnum(ruleObj.workload_balance, validBalances, 'workload_balance', `${path}[${index}].workload_balance`);
    if (balanceResult instanceof Error || (typeof balanceResult !== 'string' && balanceResult !== undefined)) {
      error = error || (balanceResult as ParseError);
    } else if (balanceResult !== undefined) {
      result.workload_balance = balanceResult;
    }
  }

  if (ruleObj.priority !== undefined) {
    const priorityResult = validateNumber(ruleObj.priority, 'priority', `${path}[${index}].priority`, false);
    if (priorityResult instanceof Error || (typeof priorityResult !== 'number' && priorityResult !== undefined)) {
      error = error || (priorityResult as ParseError);
    } else if (priorityResult !== undefined) {
      result.priority = priorityResult;
    }
  }

  if (ruleObj.id !== undefined) {
    const idResult = validateString(ruleObj.id, 'id', `${path}[${index}].id`, false);
    if (idResult instanceof Error || (typeof idResult !== 'string' && idResult !== undefined)) {
      error = error || (idResult as ParseError);
    } else if (idResult !== undefined) {
      result.id = idResult;
    }
  }

  return { rule: result, error };
}

export function parseWorkflowConfig(jsonString: string): ParseResult<WorkflowConfig> {
  // Parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch (e) {
    return {
      success: false,
      error: createError(
        'INVALID_JSON',
        'Invalid JSON syntax',
        undefined,
        { field: 'json', expected: 'valid JSON', actual: jsonString.substring(0, 100) },
      ),
    };
  }

  // Validate root object
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return {
      success: false,
      error: createError(
        'INVALID_FIELD_TYPE',
        'Configuration must be an object',
        undefined,
        { field: 'root', expected: 'object', actual: Array.isArray(parsed) ? 'array' : typeof parsed },
      ),
    };
  }

  const config = parsed as Record<string, unknown>;
  const result: Partial<WorkflowConfig> = {};
  let error: ParseError | undefined;

  // Validate required fields
  const versionResult = validateString(config.version, 'version', 'version');
  if (versionResult instanceof Error || (typeof versionResult !== 'string' && versionResult !== undefined)) {
    error = versionResult as ParseError;
  } else if (versionResult !== undefined) {
    result.version = versionResult;
  }

  const nameResult = validateString(config.name, 'name', 'name');
  if (nameResult instanceof Error || (typeof nameResult !== 'string' && nameResult !== undefined)) {
    error = error || (nameResult as ParseError);
  } else if (nameResult !== undefined) {
    result.name = nameResult;
  }

  // Validate optional description
  if (config.description !== undefined) {
    const descResult = validateString(config.description, 'description', 'description', false);
    if (descResult instanceof Error || (typeof descResult !== 'string' && descResult !== undefined)) {
      error = error || (descResult as ParseError);
    } else if (descResult !== undefined) {
      result.description = descResult;
    }
  }

  // Validate steps_before_payment array
  const stepsBeforeResult = validateArray(config.steps_before_payment, 'steps_before_payment', 'steps_before_payment');
  if (stepsBeforeResult && typeof stepsBeforeResult === 'object' && 'code' in stepsBeforeResult) {
    error = error || (stepsBeforeResult as ParseError);
  } else if (stepsBeforeResult !== undefined) {
    const steps = stepsBeforeResult as unknown[];
    const parsedSteps: Partial<WorkflowStepConfigInternal>[] = [];
    for (let i = 0; i < steps.length; i++) {
      const { config: stepConfig, error: stepError } = parseWorkflowStepConfig(steps[i], i, 'steps_before_payment');
      if (stepError) {
        error = error || stepError;
      } else {
        parsedSteps.push(stepConfig);
      }
    }
    result.steps_before_payment = parsedSteps as WorkflowStepConfigInternal[];
  }

  // Validate processing_steps array
  const processingStepsResult = validateArray(config.processing_steps, 'processing_steps', 'processing_steps');
  if (processingStepsResult && typeof processingStepsResult === 'object' && 'code' in processingStepsResult) {
    error = error || (processingStepsResult as ParseError);
  } else if (processingStepsResult !== undefined) {
    const steps = processingStepsResult as unknown[];
    const parsedSteps: Partial<WorkflowStepConfigInternal>[] = [];
    for (let i = 0; i < steps.length; i++) {
      const { config: stepConfig, error: stepError } = parseWorkflowStepConfig(steps[i], i, 'processing_steps');
      if (stepError) {
        error = error || stepError;
      } else {
        parsedSteps.push(stepConfig);
      }
    }
    result.processing_steps = parsedSteps as WorkflowStepConfigInternal[];
  }

  // Validate optional auto_assign_rules array
  if (config.auto_assign_rules !== undefined) {
    const rulesResult = validateArray(config.auto_assign_rules, 'auto_assign_rules', 'auto_assign_rules', false);
    if (rulesResult && typeof rulesResult === 'object' && 'code' in rulesResult) {
      error = error || (rulesResult as ParseError);
    } else if (rulesResult !== undefined) {
      const rules = rulesResult as unknown[];
      const parsedRules: Partial<AutoAssignRule>[] = [];
      for (let i = 0; i < rules.length; i++) {
        const { rule, error: ruleError } = parseAutoAssignRule(rules[i], i, 'auto_assign_rules');
        if (ruleError) {
          error = error || ruleError;
        } else {
          parsedRules.push(rule);
        }
      }
      result.auto_assign_rules = parsedRules as AutoAssignRule[];
    }
  }

  // Validate optional metadata
  if (config.metadata !== undefined) {
    if (typeof config.metadata !== 'object' || config.metadata === null) {
      error = error || createError(
        'INVALID_FIELD_TYPE',
        'metadata must be an object',
        'metadata',
        { field: 'metadata', expected: 'object', actual: typeof config.metadata },
      );
    } else {
      const metadata = config.metadata as Record<string, unknown>;
      const metadataResult: Partial<WorkflowMetadata> = {};

      if (metadata.created_by !== undefined) {
        const created_byResult = validateString(metadata.created_by, 'created_by', 'metadata.created_by', false);
        if (created_byResult instanceof Error || (typeof created_byResult !== 'string' && created_byResult !== undefined)) {
          error = error || (created_byResult as ParseError);
        } else if (created_byResult !== undefined) {
          metadataResult.created_by = created_byResult;
        }
      }

      if (metadata.created_at !== undefined) {
        const created_atResult = validateString(metadata.created_at, 'created_at', 'metadata.created_at', false);
        if (created_atResult instanceof Error || (typeof created_atResult !== 'string' && created_atResult !== undefined)) {
          error = error || (created_atResult as ParseError);
        } else if (created_atResult !== undefined) {
          metadataResult.created_at = created_atResult;
        }
      }

      if (metadata.version !== undefined) {
        const versionResult = validateString(metadata.version, 'version', 'metadata.version', false);
        if (versionResult instanceof Error || (typeof versionResult !== 'string' && versionResult !== undefined)) {
          error = error || (versionResult as ParseError);
        } else if (versionResult !== undefined) {
          metadataResult.version = versionResult;
        }
      }

      result.metadata = metadataResult as WorkflowMetadata;
    }
  }

  if (error) {
    return { success: false, error };
  }

  return { success: true, data: result as WorkflowConfig };
}

// ── Widget Configuration Parser ──

function parseDashboardWidget(widget: unknown, index: number, path: string): { widget: Partial<DashboardWidget>; error?: ParseError } {
  if (typeof widget !== 'object' || widget === null) {
    return {
      widget: { id: '', title: '' },
      error: createError(
        'INVALID_FIELD_TYPE',
        `Widget at index ${index} must be an object`,
        `${path}[${index}]`,
        { field: 'widget', expected: 'object', actual: typeof widget },
      ),
    };
  }

  const widgetObj = widget as Record<string, unknown>;
  const result: Partial<DashboardWidget> = { id: '', title: '' };
  let error: ParseError | undefined;

  // Validate required fields
  const idResult = validateString(widgetObj.id, 'id', `${path}[${index}].id`);
  if (idResult instanceof Error || (typeof idResult !== 'string' && idResult !== undefined)) {
    error = idResult as ParseError;
  } else if (idResult !== undefined) {
    result.id = idResult;
  }

  const typeResult = validateEnum(widgetObj.type, ['kpi', 'chart', 'forecast', 'custom'] as const, 'type', `${path}[${index}].type`);
  if (typeResult instanceof Error || (typeof typeResult !== 'string' && typeResult !== undefined)) {
    error = error || (typeResult as ParseError);
  } else if (typeResult !== undefined) {
    result.type = typeResult as DashboardWidget['type'];
  }

  const titleResult = validateString(widgetObj.title, 'title', `${path}[${index}].title`);
  if (titleResult instanceof Error || (typeof titleResult !== 'string' && titleResult !== undefined)) {
    error = error || (titleResult as ParseError);
  } else if (titleResult !== undefined) {
    result.title = titleResult;
  }

  // Parse type-specific config
  if (widgetObj.config === undefined || widgetObj.config === null) {
    error = error || createError(
      'MISSING_REQUIRED_FIELD',
      'config is required for all widgets',
      `${path}[${index}].config`,
      { field: 'config', expected: 'object', actual: typeof widgetObj.config },
    );
  } else if (typeof widgetObj.config !== 'object') {
    error = error || createError(
      'INVALID_FIELD_TYPE',
      'config must be an object',
      `${path}[${index}].config`,
      { field: 'config', expected: 'object', actual: typeof widgetObj.config },
    );
  } else {
    const config = widgetObj.config as Record<string, unknown>;

    if (result.type) {
      switch (result.type) {
        case 'kpi': {
          const kpiConfig = config as unknown as KPIConfig;

          const metricResult = validateEnum(
            kpiConfig.metric,
            ['tasks_completed', 'tasks_pending', 'revenue', 'avg_completion_time'] as const,
            'metric',
            `${path}[${index}].config.metric`,
          );
          if (metricResult instanceof Error || (typeof metricResult !== 'string' && metricResult !== undefined)) {
            error = error || (metricResult as ParseError);
          } else if (metricResult !== undefined) {
            kpiConfig.metric = metricResult;
          }

          const groupByResult = validateEnum(
            kpiConfig.groupBy,
            ['department', 'user', 'none'] as const,
            'groupBy',
            `${path}[${index}].config.groupBy`,
          );
          if (groupByResult instanceof Error || (typeof groupByResult !== 'string' && groupByResult !== undefined)) {
            error = error || (groupByResult as ParseError);
          } else if (groupByResult !== undefined) {
            kpiConfig.groupBy = groupByResult;
          }

          const timeRangeResult = validateEnum(
            kpiConfig.timeRange,
            ['day', 'week', 'month', 'year'] as const,
            'timeRange',
            `${path}[${index}].config.timeRange`,
          );
          if (timeRangeResult instanceof Error || (typeof timeRangeResult !== 'string' && timeRangeResult !== undefined)) {
            error = error || (timeRangeResult as ParseError);
          } else if (timeRangeResult !== undefined) {
            kpiConfig.timeRange = timeRangeResult;
          }

          result.config = kpiConfig;
          break;
        }

        case 'chart': {
          const chartConfig = config as unknown as ChartConfig;

          const typeResult = validateEnum(
            chartConfig.type,
            ['line', 'bar', 'pie'] as const,
            'type',
            `${path}[${index}].config.type`,
          );
          if (typeResult instanceof Error || (typeof typeResult !== 'string' && typeResult !== undefined)) {
            error = error || (typeResult as ParseError);
          } else if (typeResult !== undefined) {
            chartConfig.type = typeResult;
          }

          const metricsResult = validateArray(chartConfig.metrics, 'metrics', `${path}[${index}].config.metrics`, false);
          if (metricsResult instanceof Error || (typeof metricsResult !== 'object' && metricsResult !== undefined)) {
            error = error || (metricsResult as ParseError);
          } else if (metricsResult !== undefined) {
            const metrics = metricsResult as string[];
            if (metrics.some((m) => typeof m !== 'string')) {
              error = error || createError(
                'INVALID_FIELD_TYPE',
                'metrics must be an array of strings',
                `${path}[${index}].config.metrics`,
                { field: 'metrics', expected: 'string[]', actual: 'array with non-string values' },
              );
            } else {
              chartConfig.metrics = metrics;
            }
          }

          const timeRangeResult = validateEnum(
            chartConfig.timeRange,
            ['day', 'week', 'month', 'year'] as const,
            'timeRange',
            `${path}[${index}].config.timeRange`,
          );
          if (timeRangeResult instanceof Error || (typeof timeRangeResult !== 'string' && timeRangeResult !== undefined)) {
            error = error || (timeRangeResult as ParseError);
          } else if (timeRangeResult !== undefined) {
            chartConfig.timeRange = timeRangeResult;
          }

          if (chartConfig.groupBy !== undefined) {
            const groupByResult = validateString(chartConfig.groupBy, 'groupBy', `${path}[${index}].config.groupBy`, false);
            if (groupByResult instanceof Error || (typeof groupByResult !== 'string' && groupByResult !== undefined)) {
              error = error || (groupByResult as ParseError);
            } else if (groupByResult !== undefined) {
              chartConfig.groupBy = groupByResult;
            }
          }

          result.config = chartConfig;
          break;
        }

        case 'forecast': {
          const forecastConfig = config as unknown as ForecastConfig;

          const metricResult = validateEnum(
            forecastConfig.metric,
            ['revenue', 'tasks'] as const,
            'metric',
            `${path}[${index}].config.metric`,
          );
          if (metricResult instanceof Error || (typeof metricResult !== 'string' && metricResult !== undefined)) {
            error = error || (metricResult as ParseError);
          } else if (metricResult !== undefined) {
            forecastConfig.metric = metricResult;
          }

          if (typeof forecastConfig.historicalPeriod !== 'number') {
            error = error || createError(
              'INVALID_FIELD_TYPE',
              'historicalPeriod must be a number',
              `${path}[${index}].config.historicalPeriod`,
              { field: 'historicalPeriod', expected: 'number', actual: typeof forecastConfig.historicalPeriod },
            );
          } else {
            forecastConfig.historicalPeriod = forecastConfig.historicalPeriod;
          }

          if (typeof forecastConfig.forecastPeriod !== 'number') {
            error = error || createError(
              'INVALID_FIELD_TYPE',
              'forecastPeriod must be a number',
              `${path}[${index}].config.forecastPeriod`,
              { field: 'forecastPeriod', expected: 'number', actual: typeof forecastConfig.forecastPeriod },
            );
          } else {
            forecastConfig.forecastPeriod = forecastConfig.forecastPeriod;
          }

          if (typeof forecastConfig.confidenceInterval !== 'number') {
            error = error || createError(
              'INVALID_FIELD_TYPE',
              'confidenceInterval must be a number',
              `${path}[${index}].config.confidenceInterval`,
              { field: 'confidenceInterval', expected: 'number', actual: typeof forecastConfig.confidenceInterval },
            );
          } else {
            forecastConfig.confidenceInterval = forecastConfig.confidenceInterval;
          }

          result.config = forecastConfig;
          break;
        }

        case 'custom': {
          result.config = config;
          break;
        }
      }
    }
  }

  return { widget: result, error };
}

export function parseWidgetConfig(jsonString: string): ParseResult<WidgetConfig> {
  // Parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch (e) {
    return {
      success: false,
      error: createError(
        'INVALID_JSON',
        'Invalid JSON syntax',
        undefined,
        { field: 'json', expected: 'valid JSON', actual: jsonString.substring(0, 100) },
      ),
    };
  }

  // Validate root object
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return {
      success: false,
      error: createError(
        'INVALID_FIELD_TYPE',
        'Configuration must be an object',
        undefined,
        { field: 'root', expected: 'object', actual: Array.isArray(parsed) ? 'array' : typeof parsed },
      ),
    };
  }

  const config = parsed as Record<string, unknown>;
  const result: Partial<WidgetConfig> = {};
  let error: ParseError | undefined;

  // Validate required fields
  const versionResult = validateString(config.version, 'version', 'version');
  if (versionResult instanceof Error || (typeof versionResult !== 'string' && versionResult !== undefined)) {
    error = versionResult as ParseError;
  } else if (versionResult !== undefined) {
    result.version = versionResult;
  }

  // Validate widgets array
  const widgetsResult = validateArray(config.widgets, 'widgets', 'widgets');
  if (widgetsResult && typeof widgetsResult === 'object' && 'code' in widgetsResult) {
    error = error || (widgetsResult as ParseError);
  } else if (widgetsResult !== undefined) {
    const widgets = widgetsResult as unknown[];
    const parsedWidgets: Partial<DashboardWidget>[] = [];
    for (let i = 0; i < widgets.length; i++) {
      const { widget, error: widgetError } = parseDashboardWidget(widgets[i], i, 'widgets');
      if (widgetError) {
        error = error || widgetError;
      } else {
        parsedWidgets.push(widget);
      }
    }
    result.widgets = parsedWidgets as DashboardWidget[];
  }

  // Validate optional layout
  if (config.layout !== undefined) {
    if (typeof config.layout !== 'object' || config.layout === null) {
      error = error || createError(
        'INVALID_FIELD_TYPE',
        'layout must be an object',
        'layout',
        { field: 'layout', expected: 'object', actual: typeof config.layout },
      );
    } else {
      const layout = config.layout as Record<string, unknown>;
      const layoutResult: Partial<WidgetLayout> = {};

      if (layout.grid_columns !== undefined) {
        const gridColumnsResult = validateNumber(layout.grid_columns, 'grid_columns', 'layout.grid_columns', false);
        if (gridColumnsResult instanceof Error || (typeof gridColumnsResult !== 'number' && gridColumnsResult !== undefined)) {
          error = error || (gridColumnsResult as ParseError);
        } else if (gridColumnsResult !== undefined) {
          layoutResult.grid_columns = gridColumnsResult;
        }
      }

      if (layout.grid_rows !== undefined) {
        const gridRowsResult = validateNumber(layout.grid_rows, 'grid_rows', 'layout.grid_rows', false);
        if (gridRowsResult instanceof Error || (typeof gridRowsResult !== 'number' && gridRowsResult !== undefined)) {
          error = error || (gridRowsResult as ParseError);
        } else if (gridRowsResult !== undefined) {
          layoutResult.grid_rows = gridRowsResult;
        }
      }

      if (layout.gap !== undefined) {
        const gapResult = validateNumber(layout.gap, 'gap', 'layout.gap', false);
        if (gapResult instanceof Error || (typeof gapResult !== 'number' && gapResult !== undefined)) {
          error = error || (gapResult as ParseError);
        } else if (gapResult !== undefined) {
          layoutResult.gap = gapResult;
        }
      }

      if (Object.keys(layoutResult).length > 0) {
        result.layout = layoutResult as WidgetLayout;
      }
    }
  }

  // Validate optional metadata
  if (config.metadata !== undefined) {
    if (typeof config.metadata !== 'object' || config.metadata === null) {
      error = error || createError(
        'INVALID_FIELD_TYPE',
        'metadata must be an object',
        'metadata',
        { field: 'metadata', expected: 'object', actual: typeof config.metadata },
      );
    } else {
      const metadata = config.metadata as Record<string, unknown>;
      const metadataResult: Partial<WorkflowMetadata> = {};

      if (metadata.created_by !== undefined) {
        const created_byResult = validateString(metadata.created_by, 'created_by', 'metadata.created_by', false);
        if (created_byResult instanceof Error || (typeof created_byResult !== 'string' && created_byResult !== undefined)) {
          error = error || (created_byResult as ParseError);
        } else if (created_byResult !== undefined) {
          metadataResult.created_by = created_byResult;
        }
      }

      if (metadata.created_at !== undefined) {
        const created_atResult = validateString(metadata.created_at, 'created_at', 'metadata.created_at', false);
        if (created_atResult instanceof Error || (typeof created_atResult !== 'string' && created_atResult !== undefined)) {
          error = error || (created_atResult as ParseError);
        } else if (created_atResult !== undefined) {
          metadataResult.created_at = created_atResult;
        }
      }

      if (Object.keys(metadataResult).length > 0) {
        result.metadata = metadataResult as WorkflowMetadata;
      }
    }
  }

  if (error) {
    return { success: false, error };
  }

  return { success: true, data: result as WidgetConfig };
}
