import DatabaseException from '@lib/database.exception';
import { CollectionReference } from '@type/firestore.type';
import { getRootDocument } from '@lib/repository';

export type ClientType = {
  id: string;
  name: string;
  phone: string;
};

export type NewClientType = {
  name: string;
  phone: string;
};

function getClientCollection(): CollectionReference {
  return getRootDocument().collection('client');
}

export async function getClients(): Promise<ClientType[]> {
  let result = await getClientCollection().orderBy('name').get();

  const clients: ClientType[] = [];

  result.forEach(doc => {
    clients.push({
      id: doc.id,
      name: doc.get('name'),
      phone: doc.get('phone'),
    });
  });

  return clients;
}

export async function addClient(client: NewClientType): Promise<ClientType> {
  try {
    const doc = await getClientCollection().add(client);
    return { id: doc.id, name: client.name, phone: client.phone };
  } catch (e) {
    throw new DatabaseException('exception.db.change-fail');
  }
}

export async function removeClient(id: string): Promise<boolean> {
  const doc = getClientCollection().doc(id);

  try {
    await doc.delete();
  } catch (e) {
    throw new DatabaseException('exception.db.change-fail');
  }

  return true;
}
