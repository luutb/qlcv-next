import { describe, it, expect } from 'vitest';
import { parseWorkflowConfig, parseWidgetConfig } from '../parser';
import type { WorkflowConfig, WidgetConfig } from '../types';

describe('parseWorkflowConfig', () => {
  describe('Valid Configurations', () => {
    it('should parse a minimal valid workflow configuration', () => {
      const jsonString = JSON.stringify({
        version: '1.0.0',
        name: 'Simple Workflow',
        steps_before_payment: [
          {
            step: 1,
            step_name: 'Initial Review',
            required_role: 'staff',
            require_file: false,
          },
        ],
        processing_steps: [
          {
            step: 2,
            step_name: 'Approval',
            required_role: 'manager',
            require_file: false,
            require_approval: true,
          },
        ],
      });

      const result = parseWorkflowConfig(jsonString);

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.version).toBe('1.0.0');
        expect(result.data.name).toBe('Simple Workflow');
        expect(result.data.steps_before_payment.length).toBe(1);
        expect(result.data.processing_steps.length).toBe(1);
        expect(result.data.steps_before_payment[0].step).toBe(1);
        expect(result.data.steps_before_payment[0].step_name).toBe('Initial Review');
        expect(result.data.steps_before_payment[0].required_role).toBe('staff');
      }
    });

    it('should parse a complete workflow configuration with all fields', () => {
      const jsonString = JSON.stringify({
        version: '2.1.0',
        name: 'Complete Workflow',
        description: 'A workflow with all features',
        steps_before_payment: [
          {
            id: 'step-1',
            step: 1,
            step_name: 'Application',
            required_role: 'staff',
            require_file: true,
            require_approval: false,
            is_active: true,
            is_fixed: true,
            description: 'Initial application step',
          },
        ],
        processing_steps: [
          {
            id: 'step-2',
            step: 2,
            step_name: 'Review',
            required_role: 'manager',
            require_file: true,
            require_approval: true,
            is_active: true,
            is_fixed: false,
            description: 'Manager review step',
          },
          {
            id: 'step-3',
            step: 3,
            step_name: 'Final Approval',
            required_role: 'admin',
            require_file: false,
            require_approval: true,
            is_active: true,
            is_fixed: false,
            description: 'Final approval step',
          },
        ],
        auto_assign_rules: [
          {
            id: 'rule-1',
            name: 'Default Assignment',
            department_id: 1,
            skill_ids: [1, 2],
            workload_balance: 'round_robin',
            priority: 1,
          },
        ],
        metadata: {
          created_by: 'user-123',
          created_at: '2024-01-15T10:30:00Z',
          version: '2.1.0',
        },
      });

      const result = parseWorkflowConfig(jsonString);

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.version).toBe('2.1.0');
        expect(result.data.name).toBe('Complete Workflow');
        expect(result.data.description).toBe('A workflow with all features');
        expect(result.data.steps_before_payment.length).toBe(1);
        expect(result.data.processing_steps.length).toBe(2);
        expect(result.data.auto_assign_rules?.length).toBe(1);
        expect(result.data.metadata?.created_by).toBe('user-123');
      }
    });

    it('should parse workflow configuration without optional fields', () => {
      const jsonString = JSON.stringify({
        version: '1.0.0',
        name: 'Minimal Workflow',
        steps_before_payment: [],
        processing_steps: [],
      });

      const result = parseWorkflowConfig(jsonString);

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.version).toBe('1.0.0');
        expect(result.data.name).toBe('Minimal Workflow');
        expect(result.data.steps_before_payment).toEqual([]);
        expect(result.data.processing_steps).toEqual([]);
        expect(result.data.auto_assign_rules).toBeUndefined();
        expect(result.data.metadata).toBeUndefined();
      }
    });

    it('should parse workflow configuration with empty auto_assign_rules', () => {
      const jsonString = JSON.stringify({
        version: '1.0.0',
        name: 'Workflow with Empty Rules',
        steps_before_payment: [],
        processing_steps: [],
        auto_assign_rules: [],
      });

      const result = parseWorkflowConfig(jsonString);

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.auto_assign_rules).toEqual([]);
      }
    });
  });

  describe('Invalid Configurations', () => {
    it('should return error for missing required field "version"', () => {
      const jsonString = JSON.stringify({
        name: 'Workflow without Version',
        steps_before_payment: [],
        processing_steps: [],
      });

      const result = parseWorkflowConfig(jsonString);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.code).toBe('MISSING_REQUIRED_FIELD');
        expect(result.error?.message).toContain('version');
      }
    });

    it('should return error for missing required field "name"', () => {
      const jsonString = JSON.stringify({
        version: '1.0.0',
        steps_before_payment: [],
        processing_steps: [],
      });

      const result = parseWorkflowConfig(jsonString);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.code).toBe('MISSING_REQUIRED_FIELD');
        expect(result.error?.message).toContain('name');
      }
    });

    it('should return error for missing required field "steps_before_payment"', () => {
      const jsonString = JSON.stringify({
        version: '1.0.0',
        name: 'Workflow',
        processing_steps: [],
      });

      const result = parseWorkflowConfig(jsonString);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.code).toBe('MISSING_REQUIRED_FIELD');
        expect(result.error?.message).toContain('steps_before_payment');
      }
    });

    it('should return error for missing required field "processing_steps"', () => {
      const jsonString = JSON.stringify({
        version: '1.0.0',
        name: 'Workflow',
        steps_before_payment: [],
      });

      const result = parseWorkflowConfig(jsonString);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.code).toBe('MISSING_REQUIRED_FIELD');
        expect(result.error?.message).toContain('processing_steps');
      }
    });

    it('should return error for invalid JSON', () => {
      const jsonString = '{ invalid json }';

      const result = parseWorkflowConfig(jsonString);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.code).toBe('INVALID_JSON');
      }
    });

    it('should return error for non-object input', () => {
      const jsonString = JSON.stringify(['array', 'not', 'object']);

      const result = parseWorkflowConfig(jsonString);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.code).toBe('INVALID_FIELD_TYPE');
      }
    });

    it('should return error for invalid version type', () => {
      const jsonString = JSON.stringify({
        version: 123,
        name: 'Workflow',
        steps_before_payment: [],
        processing_steps: [],
      });

      const result = parseWorkflowConfig(jsonString);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.code).toBe('INVALID_FIELD_TYPE');
        expect(result.error?.message).toContain('version');
      }
    });

    it('should return error for invalid required_role enum value', () => {
      const jsonString = JSON.stringify({
        version: '1.0.0',
        name: 'Workflow',
        steps_before_payment: [
          {
            step: 1,
            step_name: 'Step',
            required_role: 'invalid_role' as const,
          },
        ],
        processing_steps: [],
      });

      const result = parseWorkflowConfig(jsonString);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.code).toBe('INVALID_ENUM_VALUE');
        expect(result.error?.message).toContain('required_role');
      }
    });

    it('should return error for invalid workload_balance enum value', () => {
      const jsonString = JSON.stringify({
        version: '1.0.0',
        name: 'Workflow',
        steps_before_payment: [],
        processing_steps: [],
        auto_assign_rules: [
          {
            name: 'Rule',
            workload_balance: 'invalid_balance' as const,
          },
        ],
      });

      const result = parseWorkflowConfig(jsonString);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.code).toBe('INVALID_ENUM_VALUE');
        expect(result.error?.message).toContain('workload_balance');
      }
    });

    it('should return error for invalid step field types', () => {
      const jsonString = JSON.stringify({
        version: '1.0.0',
        name: 'Workflow',
        steps_before_payment: [
          {
            step: 'not_a_number' as const,
            step_name: 'Step',
            required_role: 'staff',
          },
        ],
        processing_steps: [],
      });

      const result = parseWorkflowConfig(jsonString);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.code).toBe('INVALID_FIELD_TYPE');
        expect(result.error?.message).toContain('step');
      }
    });
  });
});

describe('parseWidgetConfig', () => {
  describe('Valid Configurations', () => {
    it('should parse a minimal valid widget configuration', () => {
      const jsonString = JSON.stringify({
        version: '1.0.0',
        widgets: [
          {
            id: 'widget-1',
            type: 'kpi',
            title: 'Tasks Completed',
            config: {
              metric: 'tasks_completed',
              groupBy: 'department',
              timeRange: 'month',
            },
          },
        ],
      });

      const result = parseWidgetConfig(jsonString);

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.version).toBe('1.0.0');
        expect(result.data.widgets.length).toBe(1);
        expect(result.data.widgets[0].type).toBe('kpi');
        expect(result.data.widgets[0].config).toEqual({
          metric: 'tasks_completed',
          groupBy: 'department',
          timeRange: 'month',
        });
      }
    });

    it('should parse a complete widget configuration with multiple widgets', () => {
      const jsonString = JSON.stringify({
        version: '1.0.0',
        widgets: [
          {
            id: 'kpi-1',
            type: 'kpi',
            title: 'Revenue',
            config: {
              metric: 'revenue',
              groupBy: 'none',
              timeRange: 'year',
            },
          },
          {
            id: 'chart-1',
            type: 'chart',
            title: 'Task Progress',
            config: {
              type: 'line',
              metrics: ['tasks_completed', 'tasks_pending'],
              timeRange: 'month',
              groupBy: 'department',
            },
          },
          {
            id: 'forecast-1',
            type: 'forecast',
            title: 'Revenue Forecast',
            config: {
              metric: 'revenue',
              historicalPeriod: 12,
              forecastPeriod: 6,
              confidenceInterval: 95,
            },
          },
          {
            id: 'custom-1',
            type: 'custom',
            title: 'Custom Widget',
            config: {
              customField: 'value',
              nested: { key: 'value' },
            },
          },
        ],
        layout: {
          grid_columns: 12,
          grid_rows: 8,
          gap: 16,
        },
        metadata: {
          created_by: 'user-123',
          created_at: '2024-01-15T10:30:00Z',
        },
      });

      const result = parseWidgetConfig(jsonString);

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.widgets.length).toBe(4);
        expect(result.data.widgets[0].type).toBe('kpi');
        expect(result.data.widgets[1].type).toBe('chart');
        expect(result.data.widgets[2].type).toBe('forecast');
        expect(result.data.widgets[3].type).toBe('custom');
        expect(result.data.layout?.grid_columns).toBe(12);
        expect(result.data.metadata?.created_by).toBe('user-123');
      }
    });

    it('should parse widget configuration without optional fields', () => {
      const jsonString = JSON.stringify({
        version: '1.0.0',
        widgets: [
          {
            id: 'widget-1',
            type: 'kpi',
            title: 'KPI',
            config: {
              metric: 'tasks_completed',
              groupBy: 'none',
              timeRange: 'day',
            },
          },
        ],
      });

      const result = parseWidgetConfig(jsonString);

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.widgets.length).toBe(1);
        expect(result.data.layout).toBeUndefined();
        expect(result.data.metadata).toBeUndefined();
      }
    });
  });

  describe('Invalid Configurations', () => {
    it('should return error for missing required field "widgets"', () => {
      const jsonString = JSON.stringify({
        version: '1.0.0',
      });

      const result = parseWidgetConfig(jsonString);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.code).toBe('MISSING_REQUIRED_FIELD');
        expect(result.error?.message).toContain('widgets');
      }
    });

    it('should return error for invalid widget type', () => {
      const jsonString = JSON.stringify({
        version: '1.0.0',
        widgets: [
          {
            id: 'widget-1',
            type: 'invalid_type' as const,
            title: 'Widget',
            config: {},
          },
        ],
      });

      const result = parseWidgetConfig(jsonString);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.code).toBe('INVALID_ENUM_VALUE');
        expect(result.error?.message).toContain('type');
      }
    });

    it('should return error for invalid KPI metric', () => {
      const jsonString = JSON.stringify({
        version: '1.0.0',
        widgets: [
          {
            id: 'widget-1',
            type: 'kpi',
            title: 'Widget',
            config: {
              metric: 'invalid_metric' as const,
              groupBy: 'none',
              timeRange: 'day',
            },
          },
        ],
      });

      const result = parseWidgetConfig(jsonString);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.code).toBe('INVALID_ENUM_VALUE');
        expect(result.error?.message).toContain('metric');
      }
    });

    it('should return error for invalid chart type', () => {
      const jsonString = JSON.stringify({
        version: '1.0.0',
        widgets: [
          {
            id: 'widget-1',
            type: 'chart',
            title: 'Widget',
            config: {
              type: 'invalid_type' as const,
              metrics: [],
              timeRange: 'day',
            },
          },
        ],
      });

      const result = parseWidgetConfig(jsonString);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.code).toBe('INVALID_ENUM_VALUE');
        expect(result.error?.message).toContain('type');
      }
    });

    it('should return error for invalid forecast metric', () => {
      const jsonString = JSON.stringify({
        version: '1.0.0',
        widgets: [
          {
            id: 'widget-1',
            type: 'forecast',
            title: 'Widget',
            config: {
              metric: 'invalid_metric' as const,
              historicalPeriod: 12,
              forecastPeriod: 6,
              confidenceInterval: 95,
            },
          },
        ],
      });

      const result = parseWidgetConfig(jsonString);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.code).toBe('INVALID_ENUM_VALUE');
        expect(result.error?.message).toContain('metric');
      }
    });

    it('should return error for missing config in widget', () => {
      const jsonString = JSON.stringify({
        version: '1.0.0',
        widgets: [
          {
            id: 'widget-1',
            type: 'kpi',
            title: 'Widget',
          },
        ],
      });

      const result = parseWidgetConfig(jsonString);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.code).toBe('MISSING_REQUIRED_FIELD');
        expect(result.error?.message).toContain('config');
      }
    });

    it('should return error for invalid layout fields', () => {
      const jsonString = JSON.stringify({
        version: '1.0.0',
        widgets: [],
        layout: {
          grid_columns: 'not_a_number' as const,
          grid_rows: 8,
          gap: 16,
        },
      });

      const result = parseWidgetConfig(jsonString);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.code).toBe('INVALID_FIELD_TYPE');
        expect(result.error?.message).toContain('grid_columns');
      }
    });
  });
});
