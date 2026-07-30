"use client";

import { DeleteOutlined, DownloadOutlined, UploadOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Empty,
  Input,
  Popconfirm,
  Space,
  Spin,
  Table,
  Typography,
  Upload,
  type TableProps,
  type UploadFile,
} from "antd";
import { useRef, useState } from "react";
import { ApiError } from "@/api/client";
import { getApiErrorPayload, getDebugErrorInfo, getUserFacingErrorMessage } from "@/api/errors";
import {
  createProfileDocument,
  deleteProfileDocument,
  downloadProfileDocument,
  listProfileDocuments,
  type ProfileDocument,
  type ProfileDocumentEntityType,
} from "@/api/profile-documents.api";
import { profileDocumentQueryKeys } from "./model/profile-document-query-keys";

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

type Feedback = { type: "success" | "error"; message: string } | null;

export type ProfileDocumentsPanelProps = {
  entityType: ProfileDocumentEntityType;
  entityId: string;
  active: boolean;
};

export function ProfileDocumentsPanel({
  entityType,
  entityId,
  active,
}: ProfileDocumentsPanelProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const uploadGuard = useRef(false);

  const queryKey = profileDocumentQueryKeys.entity(entityType, entityId);
  const documentsQuery = useQuery({
    queryKey,
    queryFn: ({ signal }) => listProfileDocuments({ entity_type: entityType, entity_id: entityId }, signal),
    enabled: active && Boolean(entityId),
  });

  const uploadMutation = useMutation({
    mutationFn: createProfileDocument,
  });

  const canUpload = documentsQuery.data?.actions?.upload === true;
  const selectedFile = fileList[0]?.originFileObj;

  async function uploadFile() {
    if (uploadGuard.current || !canUpload || !selectedFile) return;

    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      setFeedback({
        type: "error",
        message: "Tệp vượt quá giới hạn 50 MiB. Hãy chọn tệp nhỏ hơn rồi thử lại.",
      });
      return;
    }

    uploadGuard.current = true;
    setFeedback(null);
    try {
      await uploadMutation.mutateAsync({
        entity_type: entityType,
        entity_id: entityId,
        file: selectedFile,
        title,
      });
      setTitle("");
      setFileList([]);
      setFeedback({ type: "success", message: "Đã tải hồ sơ lên." });
      await queryClient.invalidateQueries({ queryKey, exact: true });
    } catch (error) {
      setFeedback({ type: "error", message: getProfileDocumentErrorMessage(error, "upload") });
    } finally {
      uploadGuard.current = false;
    }
  }

  async function downloadFile(document: ProfileDocument) {
    if (document.actions?.download !== true || downloadingId) return;

    setDownloadingId(document.id);
    setFeedback(null);
    try {
      const result = await downloadProfileDocument(document.id);
      const objectUrl = URL.createObjectURL(result.blob);
      try {
        const link = window.document.createElement("a");
        link.href = objectUrl;
        link.download = result.filename || document.file_name;
        link.style.display = "none";
        window.document.body.appendChild(link);
        link.click();
        link.remove();
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    } catch (error) {
      setFeedback({ type: "error", message: getProfileDocumentErrorMessage(error, "download") });
    } finally {
      setDownloadingId(null);
    }
  }

  async function removeFile(document: ProfileDocument) {
    if (document.actions?.delete !== true || deletingId) return;

    setDeletingId(document.id);
    setFeedback(null);
    try {
      await deleteProfileDocument(document.id);
      setFeedback({ type: "success", message: "Đã xóa hồ sơ." });
      await queryClient.invalidateQueries({ queryKey, exact: true });
    } catch (error) {
      setFeedback({ type: "error", message: getProfileDocumentErrorMessage(error, "delete") });
    } finally {
      setDeletingId(null);
    }
  }

  const columns: TableProps<ProfileDocument>["columns"] = [
    {
      title: "Hồ sơ",
      key: "document",
      render: (_, document) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{document.title}</Typography.Text>
          <Typography.Text type="secondary">{document.file_name}</Typography.Text>
        </Space>
      ),
    },
    {
      title: "Dung lượng",
      dataIndex: "file_size",
      key: "file_size",
      width: 130,
      render: (size: number) => formatFileSize(size),
    },
    {
      title: "Ngày tải lên",
      dataIndex: "created_at",
      key: "created_at",
      width: 190,
      render: (value: string) => formatDateTime(value),
    },
    {
      title: "Người tải",
      dataIndex: "uploaded_by",
      key: "uploaded_by",
      width: 170,
      render: (uploadedBy: string | null | undefined) => uploadedBy ? (
        <Typography.Text title={uploadedBy} aria-label={`Người tải: ${uploadedBy}`}>
          {compactIdentifier(uploadedBy)}
        </Typography.Text>
      ) : (
        <Typography.Text type="secondary">Không xác định</Typography.Text>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 210,
      render: (_, document) => (
        <Space wrap>
          {document.actions?.download === true ? (
            <Button
              size="small"
              icon={<DownloadOutlined />}
              loading={downloadingId === document.id}
              disabled={Boolean(downloadingId) || Boolean(deletingId)}
              onClick={() => void downloadFile(document)}
            >
              Tải xuống
            </Button>
          ) : null}
          {document.actions?.delete === true ? (
            <Popconfirm
              title="Xóa hồ sơ này?"
              description="Hồ sơ sẽ không còn xuất hiện trong danh sách."
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true, loading: deletingId === document.id }}
              disabled={Boolean(downloadingId) || Boolean(deletingId)}
              onConfirm={() => removeFile(document)}
            >
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
                disabled={Boolean(downloadingId) || Boolean(deletingId)}
              >
                Xóa
              </Button>
            </Popconfirm>
          ) : null}
        </Space>
      ),
    },
  ];

  if (!active) return null;

  if (documentsQuery.isPending) {
    return (
      <Space direction="vertical" align="center" size="middle" style={{ display: "flex", padding: 32 }}>
        <Spin />
        <Typography.Text type="secondary">Đang tải hồ sơ đính kèm...</Typography.Text>
      </Space>
    );
  }

  if (documentsQuery.isError) {
    return (
      <Alert
        type="error"
        showIcon
        message={getProfileDocumentErrorMessage(documentsQuery.error, "list")}
        description={getDebugErrorInfo(documentsQuery.error)}
        action={<Button onClick={() => documentsQuery.refetch()}>Thử lại</Button>}
      />
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      {feedback ? (
        <Alert
          type={feedback.type}
          showIcon
          message={feedback.message}
          closable
          onClose={() => setFeedback(null)}
        />
      ) : null}

      {canUpload ? (
        <Space direction="vertical" size="small" style={{ width: "100%" }}>
          <Typography.Title level={5} style={{ margin: 0 }}>Tải hồ sơ lên</Typography.Title>
          <Typography.Text type="secondary">
            Chọn một tệp tối đa 50 MiB. Quá trình tải lên chỉ hiển thị trạng thái đang xử lý vì máy chủ không cung cấp phần trăm tiến độ.
          </Typography.Text>
          <Input
            value={title}
            maxLength={255}
            placeholder="Tiêu đề (không bắt buộc)"
            aria-label="Tiêu đề hồ sơ"
            disabled={uploadMutation.isPending}
            onChange={(event) => setTitle(event.target.value)}
          />
          <Upload
            maxCount={1}
            fileList={fileList}
            beforeUpload={() => false}
            disabled={uploadMutation.isPending}
            onChange={({ fileList: nextFileList }) => {
              setFeedback(null);
              setFileList(nextFileList.slice(-1));
            }}
            onRemove={() => {
              setFileList([]);
              return true;
            }}
          >
            <Button icon={<UploadOutlined />} disabled={uploadMutation.isPending}>Chọn tệp</Button>
          </Upload>
          <Button
            type="primary"
            icon={<UploadOutlined />}
            loading={uploadMutation.isPending}
            disabled={!selectedFile || uploadMutation.isPending}
            onClick={() => void uploadFile()}
          >
            Tải lên
          </Button>
        </Space>
      ) : null}

      {documentsQuery.data.data.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có hồ sơ đính kèm" />
      ) : (
        <Table<ProfileDocument>
          rowKey="id"
          columns={columns}
          dataSource={documentsQuery.data.data}
          pagination={false}
          loading={documentsQuery.isFetching && !documentsQuery.isPending}
          scroll={{ x: 930 }}
        />
      )}
    </Space>
  );
}

type ErrorAction = "list" | "upload" | "download" | "delete";

function getProfileDocumentErrorMessage(error: unknown, action: ErrorAction): string {
  const payload = getApiErrorPayload(error);
  const code = payload?.error_code ?? payload?.code;

  if (code === "FILE_TOO_LARGE") {
    return "Tệp vượt quá giới hạn 50 MiB. Hãy chọn tệp nhỏ hơn rồi thử lại.";
  }
  if (code === "MALWARE_DETECTED") {
    return "Tệp bị từ chối vì phát hiện nội dung không an toàn. Hãy kiểm tra tệp hoặc liên hệ quản trị viên.";
  }
  if (error instanceof ApiError && error.status === 403) {
    return action === "list"
      ? "Bạn không có quyền xem hồ sơ đính kèm của đối tượng này."
      : "Bạn không có quyền thực hiện thao tác hồ sơ này. Hãy liên hệ quản trị viên nếu cần hỗ trợ.";
  }

  const fallback = getUserFacingErrorMessage(error);
  const prefix: Record<ErrorAction, string> = {
    list: "Không tải được danh sách hồ sơ.",
    upload: "Không tải được hồ sơ lên.",
    download: "Không tải được tệp xuống.",
    delete: "Không xóa được hồ sơ.",
  };
  return `${prefix[action]} ${fallback}`;
}

function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "Chưa xác định";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KiB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MiB`;
}

function compactIdentifier(value: string): string {
  return value.length > 16 ? `${value.slice(0, 8)}…${value.slice(-4)}` : value;
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}
