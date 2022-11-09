import React from 'react';
import { Text, View } from 'native-base';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { NavigationContainer } from '@react-navigation/native';

const Stack = createNativeStackNavigator();

const HomeMenu = () => {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Home Screen</Text>
    </View>
  );
};

const AppNavigation = () => {
  const { t } = useTranslation();
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={'Home'}>
        <Stack.Screen
          name="Home"
          component={HomeMenu}
          options={{ title: `HairBill - ${t('home')}` }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigation;
