import { CollectionReference } from '@type/firestore.type';
import { getRootDocument } from '@lib/repository';
import { ClientType } from '@views/app/invoice/client/client.repository';
import { ProductType } from '@views/app/services/product/product.repository';
import { defaultClient } from '@views/app/invoice/client/client-input';
import { defaultAmount } from '@views/app/invoice/total/total';
import ErrorException from '@lib/error.exception';
import { PaymentMethodType } from '@views/app/invoice/payment/pay-method';

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
  payment: PaymentMethodType;
  total: AmountType;
  updatedAt?: number | null;
  deletedAt?: number | null;
};

export const defaultReceipt = {
  id: '',
  invoiceNumber: '',
  date: new Date().valueOf(),
  client: { ...defaultClient },
  products: [],
  tip: 0,
  payment: 'pending' as PaymentMethodType,
  total: { ...defaultAmount },
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
      updatedAt: doc.get<number | null>('updatedAt'),
      deletedAt: doc.get<number | null>('deletedAt'),
    });
  });

  return invoices;
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

  let lastNumber = 0;

  if (result.size > 0) {
    const lastInvoice = result.docs.pop();
    const lastInvoiceNum = lastInvoice?.get<string>('invoiceNumber');
    if (lastInvoiceNum && lastInvoiceNum.length) {
      lastNumber = parseInt(lastInvoiceNum.slice(4), 10);
    }
  }

  return `${year.toString().slice(2)}${month > 9 ? month : '0' + month}${(
    10000 +
    lastNumber +
    1
  )
    .toString()
    .slice(1)}`;
}

export function addInvoice(invoice: InvoiceType): InvoiceType {
  const doc = getInvoiceCollection().doc();
  doc.set(invoice).catch(console.error);
  return { ...invoice, id: doc.id };
}

export function updateInvoice(invoice: InvoiceType): InvoiceType {
  if (!invoice.id) {
    throw new ErrorException(
      'badRequest',
      'NULL id provided to update invoice.',
    );
  }
  const doc = getInvoiceCollection().doc(invoice.id);

  const updatedAt = new Date().valueOf();

  doc.set({ ...invoice, updatedAt: updatedAt }).catch(console.error);
  return { ...invoice };
}

export function updateTip(id: string, tip: number): void {
  const doc = getInvoiceCollection().doc(id);
  doc.update({ tip }).catch(console.error);
}

export function softDelete(id: string): void {
  const doc = getInvoiceCollection().doc(id);
  doc.update({ deletedAt: new Date().valueOf() }).catch(console.error);
}
