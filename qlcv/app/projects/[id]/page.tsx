export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  return <main>Project {params.id}</main>;
}
