import { CollectionReference } from '@type/firestore.type';
import { getRootDocument } from '@lib/repository';
import { ClientType } from '@app/main/invoice/client/client.repository';
import { ProductType } from '@app/main/services/product/product.repository';
import { defaultClient } from '@app/main/invoice/client/client-input';
import { defaultAmount } from '@app/main/invoice/total/total';
import ErrorException from '@lib/error.exception';
import { PaymentMethodType } from '@app/main/invoice/payment/pay-method';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { GeneralSettingsType } from '@app/main/options/general/general.repository';
import {
  defaultGeneralSettings,
  defaultTaxSettings,
  TaxSettingsType,
} from '@app/main/options/sales-tax/sales-tax.repository';

export const RESULT_LIMIT = 20;

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
  updateNote: string;
  deleteNote: string;

  generalSettings: GeneralSettingsType;
  taxSettings: TaxSettingsType;
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
  updateNote: '',
  deleteNote: '',
  generalSettings: defaultGeneralSettings,
  taxSettings: defaultTaxSettings,
};

function getInvoiceCollection(): CollectionReference {
  return getRootDocument().collection('invoices');
}

function invoicesToArray(
  result: FirebaseFirestoreTypes.QuerySnapshot<FirebaseFirestoreTypes.DocumentData>,
) {
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
      updateNote: doc.get<string>('updateNote') ?? '',
      deleteNote: doc.get<string>('deleteNote') ?? '',
      generalSettings:
        doc.get<GeneralSettingsType>('generalSettings') ??
        defaultGeneralSettings,
      taxSettings:
        doc.get<TaxSettingsType>('taxSettings') ?? defaultTaxSettings,
    });
  });

  return invoices;
}

export async function getInvoices(afterDate?: number): Promise<InvoiceType[]> {
  let query = getInvoiceCollection()
    .orderBy('date', 'desc')
    .limit(RESULT_LIMIT);

  if (afterDate) {
    query = query.startAfter(afterDate);
  }

  let result = await query.get();

  return invoicesToArray(result);
}

export async function getFilteredInvoices(
  queryString: string,
  afterDate?: number,
): Promise<InvoiceType[]> {
  let query = (field: string, order: 'asc' | 'desc') =>
    getInvoiceCollection()
      .where(field, '>=', queryString)
      .where(field, '<=', queryString + '~')
      .orderBy(field, order)
      .limit(RESULT_LIMIT);

  let query1 = query('invoiceNumber', 'desc');

  let query2 = query('client.name', 'asc');
  let query3 = query('client.phone', 'asc');

  if (afterDate) {
    query1 = query1.startAfter(afterDate);
    query2 = query1.startAfter(afterDate);
    query3 = query1.startAfter(afterDate);
  }

  let result1 = invoicesToArray(await query1.get()).map(v => JSON.stringify(v));
  let result2 = invoicesToArray(await query2.get()).map(v => JSON.stringify(v));
  let result3 = invoicesToArray(await query3.get()).map(v => JSON.stringify(v));

  // Keep uniq result
  const merge = [...new Set([...result1, ...result2, ...result3])];

  return merge.map(v => JSON.parse(v));
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
  return { ...invoice, updatedAt: updatedAt };
}

export function updateTip(id: string, tip: number): void {
  const doc = getInvoiceCollection().doc(id);
  doc.update({ tip }).catch(console.error);
}

export function updateNote(id: string, text: string): void {
  const doc = getInvoiceCollection().doc(id);
  doc.update({ updateNote: text }).catch(console.error);
}

export function deleteNote(id: string, text: string): void {
  const doc = getInvoiceCollection().doc(id);
  doc.update({ deleteNote: text }).catch(console.error);
}

export function softDelete(id: string, restore = false): void {
  const doc = getInvoiceCollection().doc(id);

  if (restore) {
    doc.update({ deletedAt: null }).catch(console.error);
  } else {
    doc.update({ deletedAt: new Date().valueOf() }).catch(console.error);
  }
}
