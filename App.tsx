import React, { useEffect, useState } from 'react';
import AuthNavigation from '@views/auth-navigation';
import AppNavigation from '@views/app-navigation';
import { useTranslation } from 'react-i18next';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { Platform, NativeModules } from 'react-native';

const App = () => {
  const { i18n } = useTranslation();
  // Set an initializing state whilst Firebase connects
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  // Handle user state changes
  function onAuthStateChanged(fbUser: FirebaseAuthTypes.User | null) {
    console.log(
      'Current User: ',
      fbUser ? fbUser.email + ' verified: ' + fbUser.emailVerified : 'NULL',
    );
    if (fbUser?.emailVerified) {
      setUser(fbUser);
    }

    if (initializing) {
      setInitializing(false);
    }
  }

  // Fetch user preferred locale
  const handleLocale = async (): Promise<void> => {
    if (Platform.OS === 'ios') {
      const systemLocale =
        NativeModules.SettingsManager.settings.AppleLocale ||
        NativeModules.SettingsManager.settings.AppleLanguages[0];
      i18n.changeLanguage(systemLocale.slice(0, 2)).catch(console.error);
    }
  };

  useEffect(() => {
    handleLocale().catch(console.error);
    /********************
       BEGIN TEST CODE
     *******************/
    // auth().signOut().catch(console.error);
    // i18n.changeLanguage('en');
    /********************
        END TEST CODE
     *******************/
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  if (initializing) {
    return null;
  }

  return user ? <AppNavigation /> : <AuthNavigation />;
};

export default App;
