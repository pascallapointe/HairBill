import auth from '@react-native-firebase/auth';
import UnauthenticatedException from '@lib/unauthenticated.exception';
import DatabaseException from '@lib/database.exception';
import { CategoryType } from '@views/app/services/category/category.repository';
import firestore from '@react-native-firebase/firestore';
import { CollectionReference } from '@type/firestore.type';

export type ProductType = {
  id: string;
  name: string;
  price: number;
  category: CategoryType | null;
};

export type NewProductType = {
  name: string;
  price: number;
  category: CategoryType | null;
};

function getProductCollection(): CollectionReference {
  const user = auth().currentUser;

  if (!user) {
    throw new UnauthenticatedException();
  }

  return firestore()
    .collection('users')
    .doc(user.uid)
    .collection('service-products');
}

export async function getProducts(): Promise<ProductType[]> {
  let result = await getProductCollection().orderBy('name').get();

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

export async function addProduct(product: NewProductType): Promise<boolean> {
  try {
    await getProductCollection().add(product);
  } catch (e) {
    throw new DatabaseException('exception.db.change-fail');
  }

  return true;
}

export async function updateProduct(product: ProductType): Promise<boolean> {
  const doc = getProductCollection().doc(product.id);

  try {
    await doc.update({
      name: product.name,
      price: product.price,
      category: product.category,
    });
  } catch (e) {
    throw new DatabaseException('exception.db.change-fail');
  }

  return true;
}

export async function removeProduct(id: string): Promise<boolean> {
  const doc = getProductCollection().doc(id);

  try {
    await doc.delete();
  } catch (e) {
    throw new DatabaseException('exception.db.change-fail');
  }

  return true;
}
