export type Label = {
  id: string;
  title: string;
  color: string;
  label_type: "NORMAL" | "DEPOSIT" | "PAYMENT";
  is_archived: boolean;
  is_system?: boolean;
  description?: string;
};

export type LabelAssignment = {
  id: string;
  label_id: string;
  entity_type: "task" | "project" | "customer" | "document";
  entity_id: string;
  label?: Label;
};

export type LabelRequestOptions = { accessToken?: string; signal?: AbortSignal };
