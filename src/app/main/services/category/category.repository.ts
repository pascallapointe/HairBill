import { CollectionReference } from '@type/firestore.type';
import { getRootDocument } from '@lib/repository';

export type CategoryType = {
  id: string;
  name: string;
};

function getCategoryCollection(): CollectionReference {
  return getRootDocument().collection('service-categories');
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

export function addCategory(name: string): void {
  getCategoryCollection().add({ name: name }).catch(console.error);
}

export function removeCategory(id: string): void {
  const doc = getCategoryCollection().doc(id);
  doc.delete().catch(console.error);
}
