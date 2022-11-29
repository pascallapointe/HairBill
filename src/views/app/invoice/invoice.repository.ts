import DatabaseException from '@lib/database.exception';
import { CollectionReference } from '@type/firestore.type';
import { getRootDocument } from '@lib/repository';
import { ClientType } from '@views/app/invoice/client/client.repository';

export type InvoiceType = {
  id?: string;
  client: ClientType;
};

function getInvoiceCollection(): CollectionReference {
  return getRootDocument().collection('invoices');
}

export async function getInvoices(): Promise<InvoiceType[]> {
  let result = await getInvoiceCollection().orderBy('date', 'desc').get();

  const invoices: InvoiceType[] = [];

  result.forEach(doc => {
    invoices.push({
      id: doc.id,
      client: doc.get('client'),
    });
  });

  return invoices;
}

export async function addClient(invoice: InvoiceType): Promise<InvoiceType> {
  try {
    const doc = await getInvoiceCollection().add(invoice);
    return { ...invoice, id: doc.id };
  } catch (e) {
    throw new DatabaseException('exception.db.change-fail');
  }
}
