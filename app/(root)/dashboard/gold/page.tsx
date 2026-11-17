import {
  CategoryPageContent,
  type CategorySearchParams,
} from "@/components/dashboard/CategoryPageContent";

export default function GoldPage({
  searchParams,
}: {
  searchParams: CategorySearchParams;
}) {
  return <CategoryPageContent category="gold" searchParams={searchParams} />;
}
