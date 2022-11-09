import React, { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import { Box, Heading, VStack } from 'native-base';
import { SafeAreaView } from 'react-native';
import Card from '@components/card';
import { useTranslation } from 'react-i18next';
import ZocialIcon from 'react-native-vector-icons/Zocial';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import TextInput from '@components/form/text-input';
import ActionButton from '@components/action-button';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SignInView = () => {
  const { t } = useTranslation();
  const emailField = useRef(null);
  const [emailValue, setEmailValue] = useState('');
  const [defaultEmail, setDefaultEmail] = useState('');
  const passwordField = useRef(null);
  const [passwordValue, setPasswordValue] = useState('');
  const [wait, setWait] = useState(false);

  // Check the last signed-in email in localstorage
  useEffect(() => {
    AsyncStorage.getItem('signInEmail', (e, value) => {
      setDefaultEmail(value ? value : '');
    });
  }, []);

  function signIn() {
    setWait(true);
    const fields = [
      emailField.current.validate(),
      passwordField.current.validate(),
    ];
    if (fields.every(field => field)) {
      auth()
        .signInWithEmailAndPassword(emailValue, passwordValue)
        .then((cred: FirebaseAuthTypes.UserCredential) => {
          console.log('Signed In!', cred);
          AsyncStorage.setItem('signInEmail', emailValue);
        })
        .catch(e => {
          console.error(e);
          setWait(false);
        });
    } else {
      setWait(false);
    }
  }

  return (
    <Box
      style={{ flex: 1 }}
      bg={{
        linearGradient: {
          colors: ['fuchsia.400', 'violet.900'],
          start: [0, 0],
          end: [1, 0],
        },
      }}>
      <SafeAreaView
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <VStack space={4} alignItems="center">
          <Heading color="white" size="2xl" mb={4}>
            {t('auth.welcomeTo')}
          </Heading>
          <Card
            w="400px"
            title={t('auth.signIn')}
            titleAlign="center"
            alignItems="center">
            <VStack pb={2} space={2} alignItems="center">
              <TextInput
                ref={emailField}
                value={defaultEmail}
                bindValue={setEmailValue}
                name="email"
                label={t<string>('auth.email')}
                placeholder={t<string>('auth.emailPlaceholder')}
                icon={<ZocialIcon name="email" />}
                schema={z
                  .string({ required_error: t('validation.required') })
                  .email({
                    message: t('validation.invalidEmail'),
                  })}
                clear="while-editing"
                keyboardType="email-address"
              />
              <TextInput
                ref={passwordField}
                bindValue={setPasswordValue}
                name="password"
                label={t<string>('auth.password')}
                placeholder={t<string>('auth.password')}
                icon={<FontAwesome5Icon name="key" />}
                schema={z
                  .string({ required_error: t('validation.required') })
                  .min(8, { message: t('validation.min', { count: 8 }) })}
                clear="while-editing"
                secureTextEntry={true}
              />
              <ActionButton
                m={2}
                size="lg"
                wait={wait}
                text={t('auth.signIn')}
                action={signIn}>
                {t('auth.signIn')}
              </ActionButton>
            </VStack>
          </Card>
        </VStack>
      </SafeAreaView>
    </Box>
  );
};

export default SignInView;
