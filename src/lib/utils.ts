import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatIDR(amount: number | string) {
  const numericValue = typeof amount === "string" ? Number(amount.replace(/\D/g, "")) : amount;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericValue);
}

export function formatNumberIDR(val: string | number) {
  if (!val) return "";
  const num = typeof val === "string" ? Number(val.replace(/\D/g, "")) : val;
  if (Number.isNaN(num)) return "";
  return num.toLocaleString("id-ID");
}
