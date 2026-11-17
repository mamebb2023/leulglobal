import {
  CategoryPageContent,
  type CategorySearchParams,
} from "@/components/dashboard/CategoryPageContent";

export default function FxPage({
  searchParams,
}: {
  searchParams: CategorySearchParams;
}) {
  return <CategoryPageContent category="fx" searchParams={searchParams} />;
}
