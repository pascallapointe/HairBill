import React, { useEffect, useState } from 'react';
import AuthNavigation from '@views/auth-navigation';
import AppNavigation from '@views/app-navigation';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

const changeLocale = async (value: string) => {
  try {
    await AsyncStorage.setItem('locale', value);
  } catch (e) {
    // saving error
  }
};

const App = () => {
  const { i18n } = useTranslation();
  // Set an initializing state whilst Firebase connects
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  // Handle user state changes
  function onAuthStateChanged(fbUser: FirebaseAuthTypes.User | null) {
    console.log('Auth changed: ', user ? user.email : 'NULL');
    setUser(fbUser);

    if (initializing) {
      setInitializing(false);
    }
  }

  // Fetch user preferred locale
  const handleLocale = async (): Promise<void> => {
    try {
      const storedLocale = (await AsyncStorage.getItem('locale')) || 'en';
      await i18n.changeLanguage(storedLocale);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    // auth().signOut().catch(console.log);
    // changeLocale('fr');
    handleLocale();
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  if (initializing) {
    return null;
  }

  return user ? <AppNavigation /> : <AuthNavigation />;
};

export default App;
