export function EmptyState({ message = "Không có dữ liệu" }: { message?: string }) {
  return <p>{message}</p>;
}
