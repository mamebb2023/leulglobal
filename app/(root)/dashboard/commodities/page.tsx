import {
  CategoryPageContent,
  type CategorySearchParams,
} from "@/components/dashboard/CategoryPageContent";

export default function CommoditiesPage({
  searchParams,
}: {
  searchParams: CategorySearchParams;
}) {
  return (
    <CategoryPageContent category="commodities" searchParams={searchParams} />
  );
}
