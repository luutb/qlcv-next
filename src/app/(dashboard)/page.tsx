'use client';

import React from 'react';
import Link from 'next/link';
import {
  BriefcaseIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/api/useAuth';
import { useTasks } from '@/hooks/api/useTasks';
import { formatCurrency, formatDate } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  href?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon, 
  href 
}) => {
  const content = (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
            {icon}
          </div>
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">
              {title}
            </dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">
                {value}
              </div>
              {change && (
                <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                  changeType === 'positive' ? 'text-green-600' :
                  changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {changeType === 'positive' && (
                    <ArrowTrendingUpIcon className="self-center flex-shrink-0 h-4 w-4 text-green-500" />
                  )}
                  {change}
                </div>
              )}
            </dd>
          </dl>
        </div>
      </div>
      {href && (
        <div className="mt-4">
          <div className="flex items-center text-sm text-blue-600 hover:text-blue-500">
            View details
            <ArrowRightIcon className="ml-1 h-4 w-4" />
          </div>
        </div>
      )}
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
};

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { data: tasksResponse } = useTasks({ limit: 100 });
  const tasks = tasksResponse?.data || [];

  // Calculate stats
  const stats = React.useMemo(() => {
    const totalTasks = tasks.length;
    const myTasks = tasks.filter(task => task.assignee?.id === user?.id);
    const overdueTasks = tasks.filter(task => 
      task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done'
    );
    const completedTasks = tasks.filter(task => task.status === 'done');
    const inProgressTasks = tasks.filter(task => task.status === 'in_progress');

    return {
      totalTasks,
      myTasks: myTasks.length,
      overdueTasks: overdueTasks.length,
      completedTasks: completedTasks.length,
      inProgressTasks: inProgressTasks.length,
      completionRate: totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0,
    };
  }, [tasks, user?.id]);

  const recentTasks = React.useMemo(() => {
    return tasks
      .filter(task => task.assignee?.id === user?.id)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
  }, [tasks, user?.id]);

  const upcomingDeadlines = React.useMemo(() => {
    return tasks
      .filter(task => 
        task.dueDate && 
        new Date(task.dueDate) > new Date() && 
        task.status !== 'done'
      )
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 5);
  }, [tasks]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Here's what's happening with your cases and tasks today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Cases"
          value="24"
          change="+12%"
          changeType="positive"
          icon={<BriefcaseIcon className="h-5 w-5 text-blue-600" />}
          href="/cases"
        />
        <StatCard
          title="My Tasks"
          value={stats.myTasks}
          icon={<ClockIcon className="h-5 w-5 text-blue-600" />}
          href="/board"
        />
        <StatCard
          title="Overdue Tasks"
          value={stats.overdueTasks}
          changeType={stats.overdueTasks > 0 ? 'negative' : 'positive'}
          icon={<ExclamationTriangleIcon className="h-5 w-5 text-blue-600" />}
          href="/board?filter=overdue"
        />
        <StatCard
          title="Completion Rate"
          value={`${stats.completionRate}%`}
          change="+5%"
          changeType="positive"
          icon={<CheckCircleIcon className="h-5 w-5 text-blue-600" />}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Tasks */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">My Recent Tasks</h3>
              <Link 
                href="/board" 
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="px-6 py-4">
            {recentTasks.length > 0 ? (
              <div className="space-y-4">
                {recentTasks.map((task) => (
                  <div key={task.id} className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      task.priority === 'urgent' ? 'bg-red-500' :
                      task.priority === 'high' ? 'bg-orange-500' :
                      task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {task.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {task.taskCode} • Updated {formatDate(task.updatedAt)}
                      </p>
                    </div>
                    <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                      task.status === 'done' ? 'bg-green-100 text-green-800' :
                      task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      task.status === 'review' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.status.replace('_', ' ')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <ClockIcon className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No recent tasks</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating a new task.
                </p>
                <div className="mt-6">
                  <Link
                    href="/board"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Create Task
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Upcoming Deadlines</h3>
          </div>
          <div className="px-6 py-4">
            {upcomingDeadlines.length > 0 ? (
              <div className="space-y-4">
                {upcomingDeadlines.map((task) => (
                  <div key={task.id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {task.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {task.taskCode} • {task.assignee?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(task.dueDate!)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {Math.ceil((new Date(task.dueDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <CheckCircleIcon className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming deadlines</h3>
                <p className="mt-1 text-sm text-gray-500">
                  All tasks are on track or completed.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/cases/create"
              className="relative group bg-gray-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg hover:bg-gray-100"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white">
                  <BriefcaseIcon className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" />
                  Create Case
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Start a new legal case with client information and initial tasks.
                </p>
              </div>
            </Link>

            <Link
              href="/board"
              className="relative group bg-gray-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg hover:bg-gray-100"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                  <ClockIcon className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" />
                  Manage Tasks
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  View and organize tasks on the kanban board.
                </p>
              </div>
            </Link>

            <Link
              href="/payments"
              className="relative group bg-gray-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg hover:bg-gray-100"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-yellow-50 text-yellow-700 ring-4 ring-white">
                  <CurrencyDollarIcon className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" />
                  Track Payments
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Monitor payment status and generate invoices.
                </p>
              </div>
            </Link>

            <Link
              href="/reports"
              className="relative group bg-gray-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg hover:bg-gray-100"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-700 ring-4 ring-white">
                  <ChartBarIcon className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" />
                  View Reports
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Generate reports and analyze performance metrics.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;