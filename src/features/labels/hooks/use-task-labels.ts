"use client";

import { useMemo } from "react";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccessToken } from "@/features/auth/hooks/use-access-token";
import { labelsApi } from "../api/labels.api";

const keys = {
  labels: ["labels"] as const,
  task: (taskId: string) => ["labels", "task", taskId] as const,
};

export function useTaskLabels(taskId: string, editable: boolean) {
  const token = useAccessToken();
  const client = useQueryClient();
  const labels = useQuery({ queryKey: keys.labels, queryFn: ({ signal }) => labelsApi.list({ accessToken: token!, signal }), enabled: Boolean(token) });
  const assignments = useQuery({ queryKey: keys.task(taskId), queryFn: ({ signal }) => labelsApi.assignments("task", taskId, { accessToken: token!, signal }), enabled: Boolean(token && taskId) });
  const refresh = () => Promise.all([client.invalidateQueries({ queryKey: keys.labels }), client.invalidateQueries({ queryKey: keys.task(taskId) }), client.invalidateQueries({ queryKey: ["tasks"] })]);
  const assertEditable = () => { if (!token || !editable) throw new Error("Bạn không có quyền thay đổi nhãn."); };
  const assign = useMutation({ mutationFn: (labelId: string) => { assertEditable(); return labelsApi.setTaskLabels(taskId, [...new Set([...(assignments.data?.data.map(item => item.label_id) ?? []), labelId])], { accessToken: token! }); }, onSuccess: refresh });
  const unassign = useMutation({ mutationFn: (assignmentId: string) => { assertEditable(); return labelsApi.setTaskLabels(taskId, (assignments.data?.data ?? []).filter(item => item.id !== assignmentId).map(item => item.label_id), { accessToken: token! }); }, onSuccess: refresh });
  return { labels, assignments, assign, unassign, editable: Boolean(token && editable), isSaving: assign.isPending || unassign.isPending };
}

export function useAvailableLabels() {
  const token = useAccessToken();
  return useQuery({ queryKey: keys.labels, queryFn: ({ signal }) => labelsApi.list({ accessToken: token!, signal }), enabled: Boolean(token) });
}

export function useTaskBoardLabels(taskIds: string[], enabled = true) {
  const token = useAccessToken();
  const results = useQueries({ queries: taskIds.map((taskId) => ({
    queryKey: keys.task(taskId),
    queryFn: ({ signal }: { signal: AbortSignal }) => labelsApi.assignments("task", taskId, { accessToken: token!, signal }),
    enabled: Boolean(enabled && token && taskId),
  })) });
  const labelsByTask = useMemo(() => Object.fromEntries(taskIds.map((taskId, index) => [taskId, results[index]?.data?.data?.flatMap((assignment) => assignment.label ? [assignment.label] : []) ?? []])), [results, taskIds]);
  return { labelsByTask, isPending: results.some((result) => result.isPending) };
}
