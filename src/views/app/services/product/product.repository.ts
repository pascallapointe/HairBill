import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import UnauthenticatedException from '@lib/unauthenticated.exception';
import DatabaseException from '@lib/database.exception';
import { CategoryType } from '@views/app/services/category/category.repository';

export type ProductType = {
  key: string;
  name: string;
  price: number;
  category: CategoryType | null;
};

export type NewProductType = {
  name: string;
  price: number;
  category: CategoryType | null;
};

export async function getProducts(): Promise<ProductType[]> {
  const user = auth().currentUser;

  if (!user) {
    throw new UnauthenticatedException();
  }

  let result = await database()
    .ref(`/users/${user.uid}/service-products`)
    .orderByValue()
    .once('value');

  const products: ProductType[] = [];

  result.forEach(snap => {
    if (snap.key) {
      const value: ProductType = snap.val();
      products.push({
        key: snap.key,
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
  const user = auth().currentUser;

  if (!user) {
    throw new UnauthenticatedException();
  }

  const ref = database().ref(`/users/${user.uid}/service-products`).push();

  try {
    await ref.set(product);
  } catch (e) {
    throw new DatabaseException('exception.db.change-fail');
  }

  return true;
}

export async function updateProduct(product: ProductType): Promise<boolean> {
  const user = auth().currentUser;

  if (!user) {
    throw new UnauthenticatedException();
  }

  const ref = database().ref(
    `/users/${user.uid}/service-products/${product.key}`,
  );

  try {
    await ref.update(product);
  } catch (e) {
    throw new DatabaseException('exception.db.change-fail');
  }

  return true;
}

export async function removeProduct(key: string): Promise<boolean> {
  const user = auth().currentUser;

  if (!user) {
    throw new UnauthenticatedException();
  }

  const ref = database().ref(`/users/${user.uid}/service-products/${key}`);

  try {
    await ref.set(null);
  } catch (e) {
    throw new DatabaseException('exception.db.change-fail');
  }

  return true;
}
