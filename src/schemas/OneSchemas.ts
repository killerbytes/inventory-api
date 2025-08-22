export * from "../schemas";

export interface GroupedCategory {
  categoryId: number;
  categoryName: string;
  categoryOrder: number;
  products: any[]; // or Product[]
}
