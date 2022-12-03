import { CollectionReference } from '@type/firestore.type';
import { getRootDocument } from '@lib/repository';
import { ClientType } from '@views/app/invoice/client/client.repository';
import { ProductType } from '@views/app/services/product/product.repository';

export type AmountType = {
  subtotal: number;
  total: number;
  taxA: number;
  taxB: number;
};

export type InvoiceType = {
  id?: string;
  invoiceNumber: string;
  date: number;
  client: ClientType;
  products: ProductType[];
  tip: number;
  payment: string | null;
  total: AmountType;
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
      invoiceNumber: doc.get('invoiceNumber'),
      date: doc.get('date'),
      client: doc.get('client'),
      products: doc.get('products'),
      tip: doc.get('tip'),
      payment: doc.get('payment'),
      total: doc.get('total'),
    });
  });

  return invoices;
}

export function addInvoice(invoice: InvoiceType): InvoiceType {
  const doc = getInvoiceCollection().doc();
  doc.set(invoice).catch(console.error);
  return { ...invoice, id: doc.id };
}

export async function getNextInvoiceNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const start = new Date(`${year}-${month > 9 ? month : '0' + month}-01`);

  const result = await getInvoiceCollection()
    .orderBy('date', 'asc')
    .startAt(start.valueOf())
    .get();

  return `${year.toString().slice(2)}${month > 9 ? month : '0' + month}${(
    10000 +
    result.size +
    1
  )
    .toString()
    .slice(1)}`;
}
