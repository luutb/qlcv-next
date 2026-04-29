import { describe, it, expect } from 'vitest';
import { serializeWorkflowConfig, serializeWidgetConfig } from '../serializer';
import type { WorkflowConfig, WidgetConfig } from '../types';

describe('serializeWorkflowConfig', () => {
  describe('Basic Serialization', () => {
    it('should serialize a minimal workflow configuration', () => {
      const config: WorkflowConfig = {
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
      };

      const result = serializeWorkflowConfig(config, { pretty: false });

      expect(result).toBe(JSON.stringify(config));
    });

    it('should serialize a complete workflow configuration with all fields', () => {
      const config: WorkflowConfig = {
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
      };

      const result = serializeWorkflowConfig(config, { pretty: false });

      expect(result).toBe(JSON.stringify(config));
    });

    it('should serialize workflow configuration without optional fields', () => {
      const config: WorkflowConfig = {
        version: '1.0.0',
        name: 'Minimal Workflow',
        steps_before_payment: [],
        processing_steps: [],
      };

      const result = serializeWorkflowConfig(config, { pretty: false });

      expect(result).toBe(JSON.stringify(config));
    });

    it('should serialize workflow configuration with empty auto_assign_rules', () => {
      const config: WorkflowConfig = {
        version: '1.0.0',
        name: 'Workflow with Empty Rules',
        steps_before_payment: [],
        processing_steps: [],
        auto_assign_rules: [],
      };

      const result = serializeWorkflowConfig(config, { pretty: false });

      expect(result).toBe(JSON.stringify(config));
    });
  });

  describe('Pretty Formatting', () => {
    it('should format output with proper indentation', () => {
      const config: WorkflowConfig = {
        version: '1.0.0',
        name: 'Test Workflow',
        steps_before_payment: [],
        processing_steps: [],
      };

      const result = serializeWorkflowConfig(config, { pretty: true });

      // Check that it starts with {
      expect(result.startsWith('{')).toBe(true);
      // Check that it ends with }
      expect(result.endsWith('}')).toBe(true);
      // Check that it contains newlines (pretty printed)
      expect(result.includes('\n')).toBe(true);
      // Check that it contains proper indentation
      expect(result.includes('  "version"')).toBe(true);
    });

    it('should format steps_before_payment array properly', () => {
      const config: WorkflowConfig = {
        version: '1.0.0',
        name: 'Test Workflow',
        steps_before_payment: [
          {
            step: 1,
            step_name: 'Step 1',
            required_role: 'staff',
            require_file: false,
          },
        ],
        processing_steps: [],
      };

      const result = serializeWorkflowConfig(config, { pretty: true });

      expect(result).toContain('"steps_before_payment": [');
      expect(result).toContain('"step": 1');
      expect(result).toContain('"step_name": "Step 1"');
    });

    it('should format auto_assign_rules properly', () => {
      const config: WorkflowConfig = {
        version: '1.0.0',
        name: 'Test Workflow',
        steps_before_payment: [],
        processing_steps: [],
        auto_assign_rules: [
          {
            name: 'Test Rule',
            workload_balance: 'round_robin',
            priority: 1,
          },
        ],
      };

      const result = serializeWorkflowConfig(config, { pretty: true });

      expect(result).toContain('"auto_assign_rules": [');
      expect(result).toContain('"name": "Test Rule"');
      expect(result).toContain('"workload_balance": "round_robin"');
    });

    it('should format metadata properly', () => {
      const config: WorkflowConfig = {
        version: '1.0.0',
        name: 'Test Workflow',
        steps_before_payment: [],
        processing_steps: [],
        metadata: {
          created_by: 'user-123',
          created_at: '2024-01-15T10:30:00Z',
          version: '1.0.0',
        },
      };

      const result = serializeWorkflowConfig(config, { pretty: true });

      expect(result).toContain('"metadata": {');
      expect(result).toContain('"created_by": "user-123"');
      expect(result).toContain('"created_at": "2024-01-15T10:30:00Z"');
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in strings', () => {
      const config: WorkflowConfig = {
        version: '1.0.0',
        name: 'Test "Workflow" with "quotes"',
        description: 'Line 1\nLine 2',
        steps_before_payment: [],
        processing_steps: [],
      };

      const result = serializeWorkflowConfig(config, { pretty: false });

      expect(result).toContain('Test \\"Workflow\\" with \\"quotes\\"');
      expect(result).toContain('Line 1\\nLine 2');
    });

    it('should handle empty strings', () => {
      const config: WorkflowConfig = {
        version: '1.0.0',
        name: '',
        description: '',
        steps_before_payment: [],
        processing_steps: [],
      };

      const result = serializeWorkflowConfig(config, { pretty: false });

      expect(result).toContain('""');
    });

    it('should handle boolean false values', () => {
      const config: WorkflowConfig = {
        version: '1.0.0',
        name: 'Test',
        steps_before_payment: [
          {
            step: 1,
            step_name: 'Step',
            required_role: 'staff',
            require_file: false,
            is_active: false,
            is_fixed: false,
          },
        ],
        processing_steps: [],
      };

      const result = serializeWorkflowConfig(config, { pretty: false });

      expect(result).toContain('"require_file": false');
      expect(result).toContain('"is_active": false');
      expect(result).toContain('"is_fixed": false');
    });
  });
});

describe('serializeWidgetConfig', () => {
  describe('Basic Serialization', () => {
    it('should serialize a minimal widget configuration', () => {
      const config: WidgetConfig = {
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
      };

      const result = serializeWidgetConfig(config, { pretty: false });

      expect(result).toBe(JSON.stringify(config));
    });

    it('should serialize a complete widget configuration with multiple widgets', () => {
      const config: WidgetConfig = {
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

      const result = serializeWidgetConfig(config, { pretty: false });

      expect(result).toBe(JSON.stringify(config));
    });

    it('should serialize widget configuration without optional fields', () => {
      const config: WidgetConfig = {
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

      const result = serializeWidgetConfig(config, { pretty: false });

      expect(result).toBe(JSON.stringify(config));
    });
  });

  describe('Pretty Formatting', () => {
    it('should format output with proper indentation', () => {
      const config: WidgetConfig = {
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

      const result = serializeWidgetConfig(config, { pretty: true });

      expect(result.startsWith('{')).toBe(true);
      expect(result.endsWith('}')).toBe(true);
      expect(result.includes('\n')).toBe(true);
      expect(result.includes('  "version"')).toBe(true);
    });

    it('should format widgets array properly', () => {
      const config: WidgetConfig = {
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

      const result = serializeWidgetConfig(config, { pretty: true });

      expect(result).toContain('"widgets": [');
      expect(result).toContain('"id": "widget-1"');
      expect(result).toContain('"type": "kpi"');
    });

    it('should format layout properly', () => {
      const config: WidgetConfig = {
        version: '1.0.0',
        widgets: [],
        layout: {
          grid_columns: 12,
          grid_rows: 8,
          gap: 16,
        },
      };

      const result = serializeWidgetConfig(config, { pretty: true });

      expect(result).toContain('"layout": {');
      expect(result).toContain('"grid_columns": 12');
      expect(result).toContain('"grid_rows": 8');
      expect(result).toContain('"gap": 16');
    });

    it('should format metadata properly', () => {
      const config: WidgetConfig = {
        version: '1.0.0',
        widgets: [],
        metadata: {
          created_by: 'user-123',
          created_at: '2024-01-15T10:30:00Z',
        },
      };

      const result = serializeWidgetConfig(config, { pretty: true });

      expect(result).toContain('"metadata": {');
      expect(result).toContain('"created_by": "user-123"');
      expect(result).toContain('"created_at": "2024-01-15T10:30:00Z"');
    });
  });

  describe('Widget Type Specific Formatting', () => {
    it('should format KPI config properly', () => {
      const config: WidgetConfig = {
        version: '1.0.0',
        widgets: [
          {
            id: 'kpi-1',
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

      const result = serializeWidgetConfig(config, { pretty: true });

      expect(result).toContain('"metric": "tasks_completed"');
      expect(result).toContain('"groupBy": "department"');
      expect(result).toContain('"timeRange": "month"');
    });

    it('should format Chart config properly', () => {
      const config: WidgetConfig = {
        version: '1.0.0',
        widgets: [
          {
            id: 'chart-1',
            type: 'chart',
            title: 'Chart',
            config: {
              type: 'line',
              metrics: ['metric1', 'metric2'],
              timeRange: 'month',
            },
          },
        ],
      };

      const result = serializeWidgetConfig(config, { pretty: true });

      expect(result).toContain('"type": "line"');
      expect(result).toContain('"metrics": ["metric1", "metric2"]');
      expect(result).toContain('"timeRange": "month"');
    });

    it('should format Forecast config properly', () => {
      const config: WidgetConfig = {
        version: '1.0.0',
        widgets: [
          {
            id: 'forecast-1',
            type: 'forecast',
            title: 'Forecast',
            config: {
              metric: 'revenue',
              historicalPeriod: 12,
              forecastPeriod: 6,
              confidenceInterval: 95,
            },
          },
        ],
      };

      const result = serializeWidgetConfig(config, { pretty: true });

      expect(result).toContain('"metric": "revenue"');
      expect(result).toContain('"historicalPeriod": 12');
      expect(result).toContain('"forecastPeriod": 6');
      expect(result).toContain('"confidenceInterval": 95');
    });

    it('should format Custom config properly', () => {
      const config: WidgetConfig = {
        version: '1.0.0',
        widgets: [
          {
            id: 'custom-1',
            type: 'custom',
            title: 'Custom',
            config: {
              customField: 'value',
              nested: { key: 'value' },
            },
          },
        ],
      };

      const result = serializeWidgetConfig(config, { pretty: true });

      expect(result).toContain('"customField": "value"');
      expect(result).toContain('"nested": {');
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in strings', () => {
      const config: WidgetConfig = {
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

      const result = serializeWidgetConfig(config, { pretty: false });

      expect(result).toContain('Test \\"Widget\\" with \\"quotes\\"');
    });

    it('should handle empty arrays', () => {
      const config: WidgetConfig = {
        version: '1.0.0',
        widgets: [],
      };

      const result = serializeWidgetConfig(config, { pretty: false });

      expect(result).toContain('"widgets": []');
    });

    it('should handle empty string values', () => {
      const config: WidgetConfig = {
        version: '1.0.0',
        widgets: [
          {
            id: '',
            type: 'kpi',
            title: '',
            config: {
              metric: 'tasks_completed',
              groupBy: 'none',
              timeRange: 'day',
            },
          },
        ],
      };

      const result = serializeWidgetConfig(config, { pretty: false });

      expect(result).toContain('""');
    });
  });
});
