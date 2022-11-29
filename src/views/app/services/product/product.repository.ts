import { CategoryType } from '@views/app/services/category/category.repository';
import { CollectionReference } from '@type/firestore.type';
import { getRootDocument } from '@lib/repository';

export type ProductType = {
  id: string;
  name: string;
  price: number;
  category: CategoryType;
};

export type NewProductType = {
  name: string;
  price: number;
  category: CategoryType;
};

export type ProductsSectionType = {
  name: string;
  products: ProductType[];
};

export type ProductSectionMapType = {
  [key: string]: ProductsSectionType;
};

function getProductCollection(): CollectionReference {
  return getRootDocument().collection('service-products');
}

export async function getProducts(): Promise<ProductType[]> {
  let result = await getProductCollection()
    .orderBy('category.name', 'asc')
    .orderBy('name', 'asc')
    .get();

  const products: ProductType[] = [];

  result.forEach(snap => {
    if (snap.id) {
      const value = snap.data();
      products.push({
        id: snap.id,
        name: value.name,
        category: value.category,
        price: value.price,
      });
    }
    return undefined;
  });

  return products;
}

export function buildSectionMap(
  productsList: ProductType[],
  noCategoryText = 'No category',
): ProductSectionMapType {
  const list: ProductSectionMapType = {
    none: { name: noCategoryText, products: [] },
  };

  // Insert products
  for (const product of productsList) {
    if (!list[product.category.id]) {
      list[product.category.id] = {
        name: product.category.name,
        products: [],
      };
    }
    list[product.category.id].products.push(product);
  }

  return list;
}

export function addProduct(product: NewProductType): void {
  getProductCollection().add(product).catch(console.error);
}

export function updateProduct(product: ProductType): void {
  const doc = getProductCollection().doc(product.id);

  doc
    .update({
      name: product.name,
      price: product.price,
      category: product.category,
    })
    .catch(console.error);
}

export function removeProduct(id: string): void {
  const doc = getProductCollection().doc(id);
  doc.delete().catch(console.error);
}
