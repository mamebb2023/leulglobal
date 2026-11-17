import {
  CategoryPageContent,
  type CategorySearchParams,
} from "@/components/dashboard/CategoryPageContent";

export default function CryptoPage({
  searchParams,
}: {
  searchParams: CategorySearchParams;
}) {
  return <CategoryPageContent category="crypto" searchParams={searchParams} />;
}
