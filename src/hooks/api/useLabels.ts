import { useQuery } from '@tanstack/react-query';
import { labelService } from '@/api/services/label.service';
import { LabelsResponse, Label } from '@/types/label.types';

export const useLabels = () => {
  return useQuery<LabelsResponse>({
    queryKey: ['labels'],
    queryFn: labelService.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useLabelStatistics = () => {
  return useQuery({
    queryKey: ['labels', 'statistics'],
    queryFn: labelService.getStatistics,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Helper function to get all labels as flat array
export const useAllLabels = () => {
  const { data: labelsResponse, ...rest } = useLabels();
  
  const allLabels: Label[] = [];
  if (labelsResponse) {
    // Add system labels
    Object.values(labelsResponse.system_labels).forEach(labelArray => {
      allLabels.push(...labelArray);
    });
    // Add custom labels
    allLabels.push(...labelsResponse.custom_labels);
  }
  
  return {
    data: allLabels,
    ...rest
  };
};

// Helper to get labels by category
export const useLabelsByCategory = (category?: string) => {
  const { data: labelsResponse, ...rest } = useLabels();
  
  let labels: Label[] = [];
  if (labelsResponse && category) {
    if (category in labelsResponse.system_labels) {
      labels = labelsResponse.system_labels[category as keyof typeof labelsResponse.system_labels];
    } else if (category === 'custom') {
      labels = labelsResponse.custom_labels;
    }
  }
  
  return {
    data: labels,
    ...rest
  };
};