import { product } from "../interfaces";

export * from "../schemas";

export interface GroupedCategory {
  categoryId: number;
  categoryName: string;
  categoryOrder: number;
  products: product[];
  subCategories: {
    subCategoryId: number;
    subCategoryName: string;
    products: product[];
  }[];
}
