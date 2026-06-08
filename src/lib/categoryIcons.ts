// src/lib/categoryIcons.ts
// Lucide icons for expense / checklist categories and payment modes,
// replacing the old emoji set with the app's icon language.
import {
  Plane, BedDouble, Car, FileText, Backpack, HeartPulse, Laptop, Wallet,
  Package, UtensilsCrossed, Mountain, ShoppingBag, Banknote, Smartphone,
  CreditCard, type LucideIcon,
} from 'lucide-react'

export const CATEGORY_ICON: Record<string, LucideIcon> = {
  FLIGHTS: Plane,
  ACCOMMODATION: BedDouble,
  TRANSPORT: Car,
  PERMITS: FileText,
  GEAR: Backpack,
  HEALTH: HeartPulse,
  DOCUMENTS: FileText,
  WORK_SETUP: Laptop,
  WORK: Laptop,
  MONEY: Wallet,
  MISC: Package,
  FOOD: UtensilsCrossed,
  TREK: Mountain,
  SHOPPING: ShoppingBag,
}

export const PAYMENT_ICON: Record<string, LucideIcon> = {
  cash: Banknote,
  upi: Smartphone,
  card: CreditCard,
}

export function catIcon(key: string): LucideIcon {
  return CATEGORY_ICON[key] ?? Package
}
