import DatabaseException from '@lib/database.exception';
import { getRootDocument } from '@lib/repository';

export type GeneralSettingsType = {
  shopName: string;
  phone: string;
  employeeName: string;
  address: string;
};

export async function getGeneralSettings(): Promise<
  GeneralSettingsType | undefined
> {
  const doc = getRootDocument();

  const documentSnapshot = await doc.get();

  return documentSnapshot.get<GeneralSettingsType>('generalSettings');
}

export async function updateGeneralSettings(
  generalSettings: GeneralSettingsType,
): Promise<boolean> {
  const doc = getRootDocument();

  try {
    await doc.update({ generalSettings });
  } catch (e) {
    console.error(e);
    throw new DatabaseException('exception.db.change-fail');
  }

  return true;
}
