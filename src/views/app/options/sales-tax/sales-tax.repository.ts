import auth from '@react-native-firebase/auth';
import UnauthenticatedException from '@lib/unauthenticated.exception';
import firestore from '@react-native-firebase/firestore';
import DatabaseException from '@lib/database.exception';
import { DocumentReference } from '@type/firestore.type';

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

function getRootDocument(): DocumentReference {
  const user = auth().currentUser;

  if (!user) {
    throw new UnauthenticatedException();
  }

  const docRef = firestore().collection('users').doc(user.uid);

  docRef
    .get()
    .then(doc => {
      if (!doc.exists) {
        docRef.set({});
      }
    })
    .catch(console.error);

  return docRef;
}

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
