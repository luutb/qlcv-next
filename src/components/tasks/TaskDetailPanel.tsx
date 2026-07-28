'use client';

import React from 'react';
import { X, Edit, Calendar, User, Flag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

interface TaskDetailPanelProps {
  task: any;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskDetailPanel: React.FC<TaskDetailPanelProps> = ({
  task,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl z-50 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Chi tiết Task</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Title */}
        <div>
          <h3 className="font-medium text-gray-900 mb-2">{task.title}</h3>
          <p className="text-sm text-gray-600">{task.description}</p>
        </div>

        {/* Status */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Trạng thái:</span>
          <Badge>{task.status}</Badge>
        </div>

        {/* Assignee */}
        {task.assignee && (
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Người thực hiện:</span>
            <div className="flex items-center space-x-2">
              <Avatar className="w-6 h-6">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                  {task.assignee.name?.charAt(0) || 'U'}
                </div>
              </Avatar>
              <span className="text-sm">{task.assignee.name}</span>
            </div>
          </div>
        )}

        {/* Due Date */}
        {task.dueDate && (
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm">Hạn: {new Date(task.dueDate).toLocaleDateString('vi-VN')}</span>
          </div>
        )}

        {/* Priority */}
        <div className="flex items-center space-x-2">
          <Flag className="w-4 h-4 text-gray-400" />
          <span className="text-sm">Độ ưu tiên: {task.priority || 'Medium'}</span>
        </div>
      </div>
    </div>
  );
};