import React from 'react';
import { NativeBaseProvider } from 'native-base';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { NavigationContainer } from '@react-navigation/native';
import SignInView from '@app/auth/sign-in';
import SignUpView from '@app/auth/sign-up';

const Stack = createNativeStackNavigator();

// Linear gradient support
const config = {
  dependencies: {
    'linear-gradient': require('react-native-linear-gradient').default,
  },
};

const AuthNavigation = () => {
  const { t } = useTranslation();
  return (
    <NativeBaseProvider config={config}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={'signIn'}>
          <Stack.Screen
            name="signIn"
            component={SignInView}
            options={{ title: `HairBill - ${t('auth.signIn')}` }}
          />
          <Stack.Screen
            name="signUp"
            component={SignUpView}
            options={{ title: `HairBill - ${t('auth.newAccount')}` }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </NativeBaseProvider>
  );
};

export default AuthNavigation;
