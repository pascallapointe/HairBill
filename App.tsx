import React, { useEffect, useState } from 'react';
import AuthNavigation from './src/app/auth-navigation';
import AppNavigation from './src/app/app-navigation';
import { useTranslation } from 'react-i18next';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { Platform, NativeModules } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import firestore from '@react-native-firebase/firestore';

const App = () => {
  const { i18n } = useTranslation();
  // Set an initializing state whilst Firebase connects
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  // Handle user state changes
  function onAuthStateChanged(fbUser: FirebaseAuthTypes.User | null) {
    if (fbUser?.emailVerified) {
      setUser(fbUser);
    } else {
      if (fbUser) {
        auth().signOut().catch(console.error);
      }
      setUser(null);
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

    // Monitor auth status
    const authSubscriber = auth().onAuthStateChanged(onAuthStateChanged);

    // Monitor internet status
    const netInfoSubscriber = NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable) {
        firestore()
          .enableNetwork()
          .then(() => console.log('Firestore reading from server.'));
      } else {
        firestore()
          .disableNetwork()
          .then(() => console.log('Firestore reading from cache.'));
      }
    });

    return () => {
      authSubscriber();
      netInfoSubscriber();
    };
  }, []);

  if (initializing) {
    return null;
  }

  return user ? <AppNavigation /> : <AuthNavigation />;
};

export default App;
