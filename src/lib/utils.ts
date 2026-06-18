import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCZK(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1)} mld. Kč`;
  }
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)} mil. Kč`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(0)} tis. Kč`;
  }
  return `${amount.toFixed(0)} Kč`;
}

export function formatMWh(mwh: number): string {
  if (mwh >= 1_000_000) {
    return `${(mwh / 1_000_000).toFixed(2)} TWh`;
  }
  if (mwh >= 1_000) {
    return `${(mwh / 1_000).toFixed(1)} GWh`;
  }
  return `${mwh.toFixed(0)} MWh`;
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("cs-CZ").format(n);
}
