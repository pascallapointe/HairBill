import React from 'react';
import { NativeBaseProvider } from 'native-base';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { NavigationContainer } from '@react-navigation/native';
import MenuView from '@views/app/menu';
import ServicesView from '@views/app/services/services';

const Stack = createNativeStackNavigator();

// Linear gradient support
const config = {
  dependencies: {
    'linear-gradient': require('react-native-linear-gradient').default,
  },
};

const AppNavigation = () => {
  const { t } = useTranslation();
  return (
    <NativeBaseProvider config={config}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={'menu'}>
          <Stack.Screen
            name="menu"
            component={MenuView}
            options={{ title: `HairBill - ${t('home.title')}` }}
          />
          <Stack.Screen
            name="services"
            component={ServicesView}
            options={{ title: `HairBill - ${t('services.title')}` }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </NativeBaseProvider>
  );
};

export default AppNavigation;
