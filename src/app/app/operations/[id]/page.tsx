import { OperationDetail } from "@/components/secure/operation-detail";

export default async function OperationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OperationDetail id={id} />;
}
