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
  return getRootDocument().collection('clients');
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

export function addClient(client: NewClientType): ClientType {
  const doc = getClientCollection().doc();
  doc.set(client).catch(console.error);
  return { id: doc.id, name: client.name, phone: client.phone };
}

export function updateClient(client: ClientType): void {
  const doc = getClientCollection().doc(client.id);

  doc
    .update({
      name: client.name,
      phone: client.phone,
    })
    .catch(console.error);
}

export function removeClient(id: string): void {
  const doc = getClientCollection().doc(id);
  doc.delete().catch(console.error);
}
