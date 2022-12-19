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

export function updateGeneralSettings(
  generalSettings: GeneralSettingsType,
): void {
  const doc = getRootDocument();

  doc.update({ generalSettings }).catch(console.error);
}
