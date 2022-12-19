import React from 'react';
import { NativeBaseProvider } from 'native-base';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { NavigationContainer } from '@react-navigation/native';
import MenuView from '@app/main/menu';
import InvoiceView from '@app/main/invoice/invoice-view';
import ListsView from '@app/main/lists/lists-view';
import ServicesView from '@app/main/services/services';
import OptionsView from '@app/main/options/options-view';
import { InvoiceType } from '@app/main/invoice/invoice.repository';

export type NavigatorParamList = {
  menu: undefined;
  invoice: { invoice: InvoiceType | null };
  lists: { refresh: number };
  services: undefined;
  options: undefined;
};

const Stack = createNativeStackNavigator<NavigatorParamList>();

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
            name="invoice"
            component={InvoiceView}
            options={{ title: `HairBill - ${t('invoice.title')}` }}
            initialParams={{ invoice: null }}
          />
          <Stack.Screen
            name="lists"
            component={ListsView}
            options={{ title: `HairBill - ${t('home.listsReports')}` }}
            initialParams={{ refresh: 0 }}
          />
          <Stack.Screen
            name="services"
            component={ServicesView}
            options={{ title: `HairBill - ${t('services.title')}` }}
          />
          <Stack.Screen
            name="options"
            component={OptionsView}
            options={{ title: `HairBill - ${t('options.title')}` }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </NativeBaseProvider>
  );
};

export default AppNavigation;
