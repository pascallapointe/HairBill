import auth from '@react-native-firebase/auth';
import UnauthenticatedException from '@lib/unauthenticated.exception';
import DatabaseException from '@lib/database.exception';
import firestore from '@react-native-firebase/firestore';
import { CollectionReference } from '@type/firestore.type';

export type CategoryType = {
  id: string;
  name: string;
};

function getCategoryCollection(): CollectionReference {
  const user = auth().currentUser;

  if (!user) {
    throw new UnauthenticatedException();
  }

  return firestore()
    .collection('users')
    .doc(user.uid)
    .collection('service-categories');
}

export async function getCategories(): Promise<CategoryType[]> {
  let result = await getCategoryCollection().orderBy('name').get();

  const categories: CategoryType[] = [];

  result.forEach(snap => {
    categories.push({ id: snap.id, name: snap.get('name') });

    return undefined;
  });

  return categories;
}

export async function addCategory(name: string): Promise<boolean> {
  try {
    await getCategoryCollection().add({ name: name });
  } catch (e) {
    throw new DatabaseException('exception.db.change-fail');
  }

  return true;
}

export async function removeCategory(id: string): Promise<boolean> {
  const doc = getCategoryCollection().doc(id);

  try {
    await doc.delete();
  } catch (e) {
    throw new DatabaseException('exception.db.change-fail');
  }

  return true;
}
