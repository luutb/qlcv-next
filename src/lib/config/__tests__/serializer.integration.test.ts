import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { serializeWorkflowConfig, serializeWidgetConfig } from '../serializer';
import { parseWorkflowConfig, parseWidgetConfig } from '../parser';
import type { WorkflowConfig, WidgetConfig } from '../types';

// Mock file system operations for integration tests
vi.mock('fs', () => ({
  default: {
    writeFileSync: vi.fn(),
    readFileSync: vi.fn(),
  },
}));

describe('Workflow Configuration - Save/Load Integration', () => {
  describe('serializeWorkflowConfig + parseWorkflowConfig Round-trip', () => {
    it('should serialize and parse a workflow config to produce equivalent object', () => {
      const originalConfig: WorkflowConfig = {
        version: '1.0.0',
        name: 'Test Workflow',
        description: 'A test workflow',
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
          version: '1.0.0',
        },
      };

      // Serialize
      const serialized = serializeWorkflowConfig(originalConfig, { pretty: false });

      // Parse
      const parseResult = parseWorkflowConfig(serialized);

      expect(parseResult.success).toBe(true);
      if (parseResult.success && parseResult.data) {
        // Verify the round-trip produces equivalent object
        expect(parseResult.data.version).toBe(originalConfig.version);
        expect(parseResult.data.name).toBe(originalConfig.name);
        expect(parseResult.data.description).toBe(originalConfig.description);
        expect(parseResult.data.steps_before_payment.length).toBe(originalConfig.steps_before_payment.length);
        expect(parseResult.data.processing_steps.length).toBe(originalConfig.processing_steps.length);
        expect(parseResult.data.auto_assign_rules?.length).toBe(originalConfig.auto_assign_rules?.length);
        expect(parseResult.data.metadata?.created_by).toBe(originalConfig.metadata?.created_by);
      }
    });

    it('should handle workflow config with empty arrays', () => {
      const originalConfig: WorkflowConfig = {
        version: '1.0.0',
        name: 'Empty Workflow',
        steps_before_payment: [],
        processing_steps: [],
      };

      // Serialize
      const serialized = serializeWorkflowConfig(originalConfig, { pretty: false });

      // Parse
      const parseResult = parseWorkflowConfig(serialized);

      expect(parseResult.success).toBe(true);
      if (parseResult.success && parseResult.data) {
        expect(parseResult.data.steps_before_payment).toEqual([]);
        expect(parseResult.data.processing_steps).toEqual([]);
      }
    });

    it('should handle workflow config with null/undefined values', () => {
      const originalConfig: WorkflowConfig = {
        version: '1.0.0',
        name: 'Workflow with Nulls',
        steps_before_payment: [
          {
            step: 1,
            step_name: 'Step',
            required_role: 'staff',
            require_file: false,
          },
        ],
        processing_steps: [],
      };

      // Serialize
      const serialized = serializeWorkflowConfig(originalConfig, { pretty: false });

      // Parse
      const parseResult = parseWorkflowConfig(serialized);

      expect(parseResult.success).toBe(true);
      if (parseResult.success && parseResult.data) {
        expect(parseResult.data.name).toBe(originalConfig.name);
        expect(parseResult.data.description).toBeUndefined();
        expect(parseResult.data.auto_assign_rules).toBeUndefined();
        expect(parseResult.data.metadata).toBeUndefined();
      }
    });

    it('should handle workflow config with special characters', () => {
      const originalConfig: WorkflowConfig = {
        version: '1.0.0',
        name: 'Test "Workflow" with "quotes"',
        description: 'Line 1\nLine 2\twith tabs',
        steps_before_payment: [
          {
            step: 1,
            step_name: 'Step "with" quotes',
            required_role: 'staff',
            require_file: false,
            description: 'Description with\nnewlines',
          },
        ],
        processing_steps: [],
      };

      // Serialize
      const serialized = serializeWorkflowConfig(originalConfig, { pretty: false });

      // Parse
      const parseResult = parseWorkflowConfig(serialized);

      expect(parseResult.success).toBe(true);
      if (parseResult.success && parseResult.data) {
        expect(parseResult.data.name).toBe(originalConfig.name);
        expect(parseResult.data.description).toBe(originalConfig.description);
        expect(parseResult.data.steps_before_payment[0].step_name).toBe(originalConfig.steps_before_payment[0].step_name);
        expect(parseResult.data.steps_before_payment[0].description).toBe(originalConfig.steps_before_payment[0].description);
      }
    });

    it('should handle workflow config with all boolean fields', () => {
      const originalConfig: WorkflowConfig = {
        version: '1.0.0',
        name: 'Boolean Test Workflow',
        steps_before_payment: [
          {
            step: 1,
            step_name: 'Step',
            required_role: 'staff',
            require_file: true,
            require_approval: true,
            is_active: true,
            is_fixed: true,
          },
        ],
        processing_steps: [
          {
            step: 2,
            step_name: 'Step 2',
            required_role: 'manager',
            require_file: false,
            require_approval: false,
            is_active: false,
            is_fixed: false,
          },
        ],
      };

      // Serialize
      const serialized = serializeWorkflowConfig(originalConfig, { pretty: false });

      // Parse
      const parseResult = parseWorkflowConfig(serialized);

      expect(parseResult.success).toBe(true);
      if (parseResult.success && parseResult.data) {
        expect(parseResult.data.steps_before_payment[0].require_file).toBe(true);
        expect(parseResult.data.steps_before_payment[0].require_approval).toBe(true);
        expect(parseResult.data.steps_before_payment[0].is_active).toBe(true);
        expect(parseResult.data.steps_before_payment[0].is_fixed).toBe(true);
        expect(parseResult.data.processing_steps[0].require_file).toBe(false);
        expect(parseResult.data.processing_steps[0].require_approval).toBe(false);
        expect(parseResult.data.processing_steps[0].is_active).toBe(false);
        expect(parseResult.data.processing_steps[0].is_fixed).toBe(false);
      }
    });

    it('should handle workflow config with auto_assign_rules', () => {
      const originalConfig: WorkflowConfig = {
        version: '1.0.0',
        name: 'Auto-assign Test Workflow',
        steps_before_payment: [],
        processing_steps: [],
        auto_assign_rules: [
          {
            id: 'rule-1',
            name: 'Rule 1',
            department_id: 1,
            skill_ids: [1, 2, 3],
            workload_balance: 'round_robin',
            priority: 1,
          },
          {
            id: 'rule-2',
            name: 'Rule 2',
            workload_balance: 'least_busy',
            priority: 2,
          },
        ],
      };

      // Serialize
      const serialized = serializeWorkflowConfig(originalConfig, { pretty: false });

      // Parse
      const parseResult = parseWorkflowConfig(serialized);

      expect(parseResult.success).toBe(true);
      if (parseResult.success && parseResult.data) {
        expect(parseResult.data.auto_assign_rules?.length).toBe(2);
        expect(parseResult.data.auto_assign_rules?.[0].name).toBe('Rule 1');
        expect(parseResult.data.auto_assign_rules?.[0].skill_ids).toEqual([1, 2, 3]);
        expect(parseResult.data.auto_assign_rules?.[1].name).toBe('Rule 2');
      }
    });

    it('should handle workflow config with metadata', () => {
      const originalConfig: WorkflowConfig = {
        version: '1.0.0',
        name: 'Metadata Test Workflow',
        steps_before_payment: [],
        processing_steps: [],
        metadata: {
          created_by: 'user-123',
          created_at: '2024-01-15T10:30:00Z',
          version: '1.0.0',
        },
      };

      // Serialize
      const serialized = serializeWorkflowConfig(originalConfig, { pretty: false });

      // Parse
      const parseResult = parseWorkflowConfig(serialized);

      expect(parseResult.success).toBe(true);
      if (parseResult.success && parseResult.data) {
        expect(parseResult.data.metadata?.created_by).toBe('user-123');
        expect(parseResult.data.metadata?.created_at).toBe('2024-01-15T10:30:00Z');
        expect(parseResult.data.metadata?.version).toBe('1.0.0');
      }
    });
  });

  describe('Pretty Formatting Integration', () => {
    it('should serialize with pretty formatting and still parse correctly', () => {
      const originalConfig: WorkflowConfig = {
        version: '2.0.0',
        name: 'Pretty Format Test',
        description: 'Testing pretty formatting',
        steps_before_payment: [
          {
            step: 1,
            step_name: 'Step 1',
            required_role: 'staff',
            require_file: false,
          },
        ],
        processing_steps: [
          {
            step: 2,
            step_name: 'Step 2',
            required_role: 'manager',
            require_file: true,
            require_approval: true,
          },
        ],
        auto_assign_rules: [
          {
            name: 'Rule',
            workload_balance: 'round_robin',
          },
        ],
        metadata: {
          created_by: 'user-456',
        },
      };

      // Serialize with pretty formatting
      const serialized = serializeWorkflowConfig(originalConfig, { pretty: true });

      // Verify it's pretty printed
      expect(serialized).toContain('\n');
      expect(serialized).toContain('  "version"');

      // Parse
      const parseResult = parseWorkflowConfig(serialized);

      expect(parseResult.success).toBe(true);
      if (parseResult.success && parseResult.data) {
        expect(parseResult.data.version).toBe(originalConfig.version);
        expect(parseResult.data.name).toBe(originalConfig.name);
        expect(parseResult.data.description).toBe(originalConfig.description);
      }
    });
  });
});

describe('Widget Configuration - Save/Load Integration', () => {
  describe('serializeWidgetConfig + parseWidgetConfig Round-trip', () => {
    it('should serialize and parse a widget config to produce equivalent object', () => {
      const originalConfig: WidgetConfig = {
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
      };

      // Serialize
      const serialized = serializeWidgetConfig(originalConfig, { pretty: false });

      // Parse
      const parseResult = parseWidgetConfig(serialized);

      expect(parseResult.success).toBe(true);
      if (parseResult.success && parseResult.data) {
        // Verify the round-trip produces equivalent object
        expect(parseResult.data.version).toBe(originalConfig.version);
        expect(parseResult.data.widgets.length).toBe(originalConfig.widgets.length);
        expect(parseResult.data.layout?.grid_columns).toBe(originalConfig.layout?.grid_columns);
        expect(parseResult.data.metadata?.created_by).toBe(originalConfig.metadata?.created_by);
      }
    });

    it('should handle widget config with single widget', () => {
      const originalConfig: WidgetConfig = {
        version: '1.0.0',
        widgets: [
          {
            id: 'widget-1',
            type: 'kpi',
            title: 'KPI',
            config: {
              metric: 'tasks_completed',
              groupBy: 'department',
              timeRange: 'month',
            },
          },
        ],
      };

      // Serialize
      const serialized = serializeWidgetConfig(originalConfig, { pretty: false });

      // Parse
      const parseResult = parseWidgetConfig(serialized);

      expect(parseResult.success).toBe(true);
      if (parseResult.success && parseResult.data) {
        expect(parseResult.data.widgets.length).toBe(1);
        expect(parseResult.data.widgets[0].type).toBe('kpi');
      }
    });

    it('should handle widget config without layout', () => {
      const originalConfig: WidgetConfig = {
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
      };

      // Serialize
      const serialized = serializeWidgetConfig(originalConfig, { pretty: false });

      // Parse
      const parseResult = parseWidgetConfig(serialized);

      expect(parseResult.success).toBe(true);
      if (parseResult.success && parseResult.data) {
        expect(parseResult.data.layout).toBeUndefined();
      }
    });

    it('should handle widget config with special characters', () => {
      const originalConfig: WidgetConfig = {
        version: '1.0.0',
        widgets: [
          {
            id: 'widget-1',
            type: 'kpi',
            title: 'Test "Widget" with "quotes"',
            config: {
              metric: 'tasks_completed',
              groupBy: 'none',
              timeRange: 'day',
            },
          },
        ],
      };

      // Serialize
      const serialized = serializeWidgetConfig(originalConfig, { pretty: false });

      // Parse
      const parseResult = parseWidgetConfig(serialized);

      expect(parseResult.success).toBe(true);
      if (parseResult.success && parseResult.data) {
        expect(parseResult.data.widgets[0].title).toBe(originalConfig.widgets[0].title);
      }
    });

    it('should handle widget config with all widget types', () => {
      const originalConfig: WidgetConfig = {
        version: '1.0.0',
        widgets: [
          {
            id: 'kpi-1',
            type: 'kpi',
            title: 'KPI',
            config: {
              metric: 'tasks_completed',
              groupBy: 'none',
              timeRange: 'day',
            },
          },
          {
            id: 'chart-1',
            type: 'chart',
            title: 'Chart',
            config: {
              type: 'bar',
              metrics: ['metric1', 'metric2'],
              timeRange: 'week',
            },
          },
          {
            id: 'forecast-1',
            type: 'forecast',
            title: 'Forecast',
            config: {
              metric: 'tasks',
              historicalPeriod: 24,
              forecastPeriod: 12,
              confidenceInterval: 90,
            },
          },
          {
            id: 'custom-1',
            type: 'custom',
            title: 'Custom',
            config: {
              customField: 'value',
            },
          },
        ],
      };

      // Serialize
      const serialized = serializeWidgetConfig(originalConfig, { pretty: false });

      // Parse
      const parseResult = parseWidgetConfig(serialized);

      expect(parseResult.success).toBe(true);
      if (parseResult.success && parseResult.data) {
        expect(parseResult.data.widgets.length).toBe(4);
        expect(parseResult.data.widgets[0].type).toBe('kpi');
        expect(parseResult.data.widgets[1].type).toBe('chart');
        expect(parseResult.data.widgets[2].type).toBe('forecast');
        expect(parseResult.data.widgets[3].type).toBe('custom');
      }
    });

    it('should handle widget config with empty widgets array', () => {
      const originalConfig: WidgetConfig = {
        version: '1.0.0',
        widgets: [],
      };

      // Serialize
      const serialized = serializeWidgetConfig(originalConfig, { pretty: false });

      // Parse
      const parseResult = parseWidgetConfig(serialized);

      expect(parseResult.success).toBe(true);
      if (parseResult.success && parseResult.data) {
        expect(parseResult.data.widgets).toEqual([]);
      }
    });

    it('should handle widget config with metadata', () => {
      const originalConfig: WidgetConfig = {
        version: '1.0.0',
        widgets: [],
        metadata: {
          created_by: 'user-789',
          created_at: '2024-02-20T15:45:00Z',
        },
      };

      // Serialize
      const serialized = serializeWidgetConfig(originalConfig, { pretty: false });

      // Parse
      const parseResult = parseWidgetConfig(serialized);

      expect(parseResult.success).toBe(true);
      if (parseResult.success && parseResult.data) {
        expect(parseResult.data.metadata?.created_by).toBe('user-789');
        expect(parseResult.data.metadata?.created_at).toBe('2024-02-20T15:45:00Z');
      }
    });
  });

  describe('Pretty Formatting Integration', () => {
    it('should serialize widget config with pretty formatting and still parse correctly', () => {
      const originalConfig: WidgetConfig = {
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
        layout: {
          grid_columns: 12,
          grid_rows: 8,
          gap: 16,
        },
      };

      // Serialize with pretty formatting
      const serialized = serializeWidgetConfig(originalConfig, { pretty: true });

      // Verify it's pretty printed
      expect(serialized).toContain('\n');
      expect(serialized).toContain('  "version"');

      // Parse
      const parseResult = parseWidgetConfig(serialized);

      expect(parseResult.success).toBe(true);
      if (parseResult.success && parseResult.data) {
        expect(parseResult.data.version).toBe(originalConfig.version);
        expect(parseResult.data.widgets.length).toBe(originalConfig.widgets.length);
        expect(parseResult.data.layout?.grid_columns).toBe(originalConfig.layout?.grid_columns);
      }
    });
  });
});
