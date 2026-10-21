import type { ProductUnit } from '@/products/product-service';

export interface Intake {
  id: string;
  productId: string;
  takenAt: Date;
  quantity: number;
  productName: string;
  category: string;
  unit: ProductUnit | null;
  profileImageFileName: string | null;
}

export interface IntakeEdit {
  quantity: number;
  takenAt: Date;
}
