import { DocumentReference } from '@type/firestore.type';
import auth from '@react-native-firebase/auth';
import UnauthenticatedException from '@lib/unauthenticated.exception';
import firestore from '@react-native-firebase/firestore';

export function getRootDocument(): DocumentReference {
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
