import {
  Bitcoin,
  Coins,
  DollarSign,
  Droplets,
  type LucideIcon,
} from "lucide-react";
import type { CategoryId } from "./registry";

/**
 * The single icon per category. The sidebar and each page header both read
 * this map, so a page never flies a different flag than the nav item that
 * leads to it.
 */
export const CATEGORY_ICONS: Record<CategoryId, LucideIcon> = {
  gold: Coins,
  crypto: Bitcoin,
  fx: DollarSign,
  commodities: Droplets,
};
