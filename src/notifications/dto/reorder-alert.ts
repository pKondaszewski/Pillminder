export interface ReorderAlert {
  productId: string;
  productName: string;
  storeLink: string | null;
  canAddPack: boolean;
  reorderAt: Date;
}
