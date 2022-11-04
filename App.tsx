import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NativeBaseProvider } from 'native-base';
import AuthView from '@views/auth';
import HomeView from '@views/home';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createNativeStackNavigator();

const App = () => {
  const { t, i18n } = useTranslation();

  const setLocale = async () => {
    try {
      const locale = await AsyncStorage.getItem('@storage_Key');
      await i18n.changeLanguage(locale ? locale : 'en');
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    setLocale();
  });

  return (
    <NativeBaseProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen
            name="Auth"
            component={AuthView}
            options={{ title: 'HairBill - Sign In' }}
          />
          <Stack.Screen
            name="Home"
            component={HomeView}
            options={{ title: `HairBill - ${t('Home')}` }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </NativeBaseProvider>
  );
};

export default App;
