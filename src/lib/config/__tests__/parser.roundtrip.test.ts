import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { parseWorkflowConfig, parseWidgetConfig } from '../parser';
import type { WorkflowConfig, WidgetConfig } from '../types';

describe('parseWorkflowConfig - Round-trip Property Tests', () => {
  it(
    'should parse a serialized workflow config and produce equivalent object',
    () => {
      fc.assert(
        fc.property(
          fc.record(
            {
              version: fc.constant('1.0.0'),
              name: fc.string(),
              description: fc.option(fc.string(), { nil: '' }),
              steps_before_payment: fc.array(
                fc.record(
                  {
                    step: fc.integer({ min: 1, max: 10 }),
                    step_name: fc.string(),
                    required_role: fc.constantFrom<'admin' | 'manager' | 'staff' | 'accountant'>('admin', 'manager', 'staff', 'accountant'),
                    require_file: fc.boolean(),
                    require_approval: fc.option(fc.boolean(), { nil: false }),
                    is_active: fc.option(fc.boolean(), { nil: true }),
                    is_fixed: fc.option(fc.boolean(), { nil: false }),
                    description: fc.option(fc.string(), { nil: '' }),
                    id: fc.option(fc.string(), { nil: '' }),
                  },
                  { requiredKeys: ['step', 'step_name', 'required_role'] },
                ),
              ),
              processing_steps: fc.array(
                fc.record(
                  {
                    step: fc.integer({ min: 1, max: 10 }),
                    step_name: fc.string(),
                    required_role: fc.constantFrom<'admin' | 'manager' | 'staff' | 'accountant'>('admin', 'manager', 'staff', 'accountant'),
                    require_file: fc.boolean(),
                    require_approval: fc.option(fc.boolean(), { nil: false }),
                    is_active: fc.option(fc.boolean(), { nil: true }),
                    is_fixed: fc.option(fc.boolean(), { nil: false }),
                    description: fc.option(fc.string(), { nil: '' }),
                    id: fc.option(fc.string(), { nil: '' }),
                  },
                  { requiredKeys: ['step', 'step_name', 'required_role'] },
                ),
              ),
              auto_assign_rules: fc.option(
                fc.array(
                  fc.record(
                    {
                      id: fc.option(fc.string(), { nil: '' }),
                      name: fc.string(),
                      department_id: fc.option(fc.integer({ min: 1, max: 100 }), { nil: undefined }),
                      skill_ids: fc.option(fc.array(fc.integer({ min: 1, max: 50 }), { minLength: 0 }), { nil: undefined }),
                      workload_balance: fc.constantFrom<'round_robin' | 'least_busy' | 'most_available'>('round_robin', 'least_busy', 'most_available'),
                      priority: fc.option(fc.integer({ min: 1, max: 10 }), { nil: undefined }),
                    },
                    { requiredKeys: ['name', 'workload_balance'] },
                  ),
                ),
                { nil: undefined },
              ),
              metadata: fc.option(
                fc.record(
                  {
                    created_by: fc.option(fc.string(), { nil: undefined }),
                    created_at: fc.option(fc.string(), { nil: undefined }),
                    version: fc.option(fc.string(), { nil: undefined }),
                  },
                  { requiredKeys: [] },
                ),
                { nil: undefined },
              ),
            },
            { requiredKeys: ['version', 'name', 'steps_before_payment', 'processing_steps'] },
          ),
          (workflowConfig) => {
            // Serialize the config
            const jsonString = JSON.stringify(workflowConfig);

            // Parse the serialized config
            const parseResult1 = parseWorkflowConfig(jsonString);

            expect(parseResult1.success).toBe(true);
            if (!parseResult1.success || !parseResult1.data) {
              return;
            }

            // Serialize again
            const jsonString2 = JSON.stringify(parseResult1.data);

            // Parse again
            const parseResult2 = parseWorkflowConfig(jsonString2);

            expect(parseResult2.success).toBe(true);
            if (!parseResult2.success || !parseResult2.data) {
              return;
            }

            // Verify the round-trip produces equivalent objects
            expect(parseResult2.data.version).toBe(parseResult1.data.version);
            expect(parseResult2.data.name).toBe(parseResult1.data.name);
            expect(parseResult2.data.steps_before_payment.length).toBe(parseResult1.data.steps_before_payment.length);
            expect(parseResult2.data.processing_steps.length).toBe(parseResult1.data.processing_steps.length);
          },
        ),
        { numRuns: 100, seed: 42 },
      );
    },
  );
});

describe('parseWidgetConfig - Round-trip Property Tests', () => {
  it(
    'should parse a serialized widget config and produce equivalent object',
    () => {
      fc.assert(
        fc.property(
          fc.record(
            {
              version: fc.constant('1.0.0'),
              widgets: fc.array(
                fc.oneof(
                  // KPI Widget
                  fc.record(
                    {
                      id: fc.string(),
                      type: fc.constant<'kpi'>('kpi'),
                      title: fc.string(),
                      config: fc.record(
                        {
                          metric: fc.constantFrom<'tasks_completed' | 'tasks_pending' | 'revenue' | 'avg_completion_time'>('tasks_completed', 'tasks_pending', 'revenue', 'avg_completion_time'),
                          groupBy: fc.constantFrom<'department' | 'user' | 'none'>('department', 'user', 'none'),
                          timeRange: fc.constantFrom<'day' | 'week' | 'month' | 'year'>('day', 'week', 'month', 'year'),
                        },
                        { requiredKeys: ['metric', 'groupBy', 'timeRange'] },
                      ),
                    },
                    { requiredKeys: ['id', 'type', 'title', 'config'] },
                  ),
                  // Chart Widget
                  fc.record(
                    {
                      id: fc.string(),
                      type: fc.constant<'chart'>('chart'),
                      title: fc.string(),
                      config: fc.record(
                        {
                          type: fc.constantFrom<'line' | 'bar' | 'pie'>('line', 'bar', 'pie'),
                          metrics: fc.array(fc.string(), { minLength: 1 }),
                          timeRange: fc.constantFrom<'day' | 'week' | 'month' | 'year'>('day', 'week', 'month', 'year'),
                          groupBy: fc.option(fc.string(), { nil: undefined }),
                        },
                        { requiredKeys: ['type', 'metrics', 'timeRange'] },
                      ),
                    },
                    { requiredKeys: ['id', 'type', 'title', 'config'] },
                  ),
                  // Forecast Widget
                  fc.record(
                    {
                      id: fc.string(),
                      type: fc.constant<'forecast'>('forecast'),
                      title: fc.string(),
                      config: fc.record(
                        {
                          metric: fc.constantFrom<'revenue' | 'tasks'>('revenue', 'tasks'),
                          historicalPeriod: fc.integer({ min: 1, max: 120 }),
                          forecastPeriod: fc.integer({ min: 1, max: 120 }),
                          confidenceInterval: fc.integer({ min: 0, max: 100 }),
                        },
                        { requiredKeys: ['metric', 'historicalPeriod', 'forecastPeriod', 'confidenceInterval'] },
                      ),
                    },
                    { requiredKeys: ['id', 'type', 'title', 'config'] },
                  ),
                  // Custom Widget
                  fc.record(
                    {
                      id: fc.string(),
                      type: fc.constant<'custom'>('custom'),
                      title: fc.string(),
                      config: fc.record(
                        {
                          customField: fc.string(),
                          nested: fc.record({ key: fc.string() }),
                        },
                        { requiredKeys: [] },
                      ),
                    },
                    { requiredKeys: ['id', 'type', 'title', 'config'] },
                  ),
                ),
                { minLength: 1 },
              ),
              layout: fc.option(
                fc.record(
                  {
                    grid_columns: fc.integer({ min: 1, max: 24 }),
                    grid_rows: fc.integer({ min: 1, max: 24 }),
                    gap: fc.integer({ min: 0, max: 100 }),
                  },
                  { requiredKeys: ['grid_columns', 'grid_rows', 'gap'] },
                ),
                { nil: undefined },
              ),
              metadata: fc.option(
                fc.record(
                  {
                    created_by: fc.option(fc.string(), { nil: undefined }),
                    created_at: fc.option(fc.string(), { nil: undefined }),
                  },
                  { requiredKeys: [] },
                ),
                { nil: undefined },
              ),
            },
            { requiredKeys: ['version', 'widgets'] },
          ),
          (widgetConfig) => {
            // Serialize the config
            const jsonString = JSON.stringify(widgetConfig);

            // Parse the serialized config
            const parseResult1 = parseWidgetConfig(jsonString);

            expect(parseResult1.success).toBe(true);
            if (!parseResult1.success || !parseResult1.data) {
              return;
            }

            // Serialize again
            const jsonString2 = JSON.stringify(parseResult1.data);

            // Parse again
            const parseResult2 = parseWidgetConfig(jsonString2);

            expect(parseResult2.success).toBe(true);
            if (!parseResult2.success || !parseResult2.data) {
              return;
            }

            // Verify the round-trip produces equivalent objects
            expect(parseResult2.data.version).toBe(parseResult1.data.version);
            expect(parseResult2.data.widgets.length).toBe(parseResult1.data.widgets.length);
          },
        ),
        { numRuns: 100, seed: 42 },
      );
    },
  );
});
