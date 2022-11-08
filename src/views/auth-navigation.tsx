import React from 'react';
import { NativeBaseProvider } from 'native-base';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { NavigationContainer } from '@react-navigation/native';
import SignInView from '@views/auth/sign-in';
import RegisterView from '@views/auth/register';

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
        <Stack.Navigator initialRouteName={'SignIn'}>
          <Stack.Screen
            name="SignIn"
            component={SignInView}
            options={{ title: `HairBill - ${t('auth.SignIn')}` }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterView}
            options={{ title: `HairBill - ${t('auth.Register')}` }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </NativeBaseProvider>
  );
};

export default AuthNavigation;
