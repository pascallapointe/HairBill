import DatabaseException from '@lib/database.exception';
import { getRootDocument } from '@lib/repository';

export type TaxSettingsType = {
  enabled: boolean;
  useBTax: boolean;
  compounded: boolean;
  taxNumber: string;
  taxAName: string;
  taxA: number;
  taxBName: string;
  taxB: number;
};

export async function getTaxSettings(): Promise<TaxSettingsType | undefined> {
  const doc = getRootDocument();

  const documentSnapshot = await doc.get();

  return documentSnapshot.get<TaxSettingsType>('taxSettings');
}

export async function updateTaxSettings(
  taxSettings: TaxSettingsType,
): Promise<boolean> {
  const doc = getRootDocument();

  try {
    await doc.update({ taxSettings });
  } catch (e) {
    console.error(e);
    throw new DatabaseException('exception.db.change-fail');
  }

  return true;
}
