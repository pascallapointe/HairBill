import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import UnauthenticatedException from '@lib/unauthenticated.exception';
import DatabaseException from '@lib/database.exception';

export async function getCategories(): Promise<
  { key: string; name: string }[]
> {
  const user = auth().currentUser;

  if (!user) {
    throw new UnauthenticatedException();
  }

  let result = await database()
    .ref(`/users/${user.uid}/service-categories`)
    .orderByValue()
    .once('value');

  const categories: { key: string; name: string }[] = [];

  result.forEach(snap => {
    categories.push({ key: snap.key!, name: snap.val() });
    return undefined;
  });

  return categories;
}

export async function addCategory(name: string): Promise<boolean> {
  const user = auth().currentUser;

  if (!user) {
    throw new UnauthenticatedException();
  }

  const ref = database().ref(`/users/${user.uid}/service-categories`).push();

  try {
    await ref.set(name);
  } catch (e) {
    throw new DatabaseException('exception.db.change-fail');
  }

  return true;
}

export async function removeCategory(key: string): Promise<boolean> {
  const user = auth().currentUser;

  if (!user) {
    throw new UnauthenticatedException();
  }

  const ref = database().ref(`/users/${user.uid}/service-categories/${key}`);

  try {
    await ref.set(null);
  } catch (e) {
    throw new DatabaseException('exception.db.change-fail');
  }

  return true;
}
