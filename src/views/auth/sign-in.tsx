import React, { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import { Box, Button, Heading, Text, VStack } from 'native-base';
import { SafeAreaView } from 'react-native';
import Card from '@components/card';
import { useTranslation } from 'react-i18next';
import ZocialIcon from 'react-native-vector-icons/Zocial';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import TextInput, { InputRef } from '@components/form/text-input';
import ActionButton from '@components/action-button';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal, { ModalRef } from '@components/modal';
import { NavigationProp, ParamListBase } from '@react-navigation/native';

interface Props {
  navigation: NavigationProp<ParamListBase>;
}

const SignInView: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const emailField = useRef<InputRef>(null);
  const [emailValue, setEmailValue] = useState('');
  const [defaultEmail, setDefaultEmail] = useState('');
  const passwordField = useRef<InputRef>(null);
  const [passwordValue, setPasswordValue] = useState('');
  const [wait, setWait] = useState(false);
  const errorModal = useRef<ModalRef>(null);
  const emailCheckModal = useRef<ModalRef>(null);

  // Check the last signed-in email in localstorage
  useEffect(() => {
    AsyncStorage.getItem('signInEmail', (e, value) => {
      setDefaultEmail(value ? value : '');
    });
  }, []);

  function signIn() {
    setWait(true);
    const fields = [
      emailField.current && emailField.current.validate(),
      passwordField.current && passwordField.current.validate(),
    ];
    if (fields.every(field => field)) {
      auth()
        .signInWithEmailAndPassword(emailValue, passwordValue)
        .then((cred: FirebaseAuthTypes.UserCredential) => {
          AsyncStorage.setItem('signInEmail', emailValue);
          AsyncStorage.setItem('userID', cred.user.uid);

          if (!cred.user.emailVerified) {
            emailCheckModal.current && emailCheckModal.current.open();
          }

          /**
           * Listener in App.tsx will intercept the auth change
           */
        })
        .catch(e => {
          console.error(e);
          errorModal.current && errorModal.current.open();
        });
    } else {
      setWait(false);
    }
  }

  function signOut() {
    setWait(false);
    auth().signOut().catch(console.error);
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
          <Heading color="white" size="4xl" mb={4} fontFamily="SignPainter">
            &nbsp;HairBill&nbsp;
          </Heading>
          <Card
            w="400px"
            title={t('auth.signIn')}
            titleAlign="center"
            alignItems="center">
            <VStack pb={2} space={2} alignItems="center">
              <TextInput
                value={defaultEmail}
                bindValue={setEmailValue}
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
                ref={emailField}
              />
              <TextInput
                bindValue={setPasswordValue}
                label={t<string>('auth.password')}
                placeholder={t<string>('auth.password')}
                icon={<FontAwesome5Icon name="key" />}
                schema={z
                  .string({ required_error: t('validation.required') })
                  .min(8, t<string>('validation.min', { count: 8 }))}
                clear="while-editing"
                secureTextEntry={true}
                ref={passwordField}
              />
              <ActionButton
                m={2}
                size="lg"
                wait={wait}
                text={t('auth.signIn')}
                colorScheme="violet"
                action={signIn}
              />
            </VStack>
          </Card>
          <Text color="white" fontSize="md" fontWeight="bold">
            {t('auth.noAccountYet')}?
          </Text>
          <Button
            onPress={() => navigation.navigate('signUp')}
            colorScheme="fuchsia"
            size="lg"
            shadow={5}>
            {t('auth.createAccount')}
          </Button>
        </VStack>
        <Modal
          ref={errorModal}
          hideAction={true}
          title={t('auth.authFailure.title')}
          callback={() => setWait(false)}>
          <Text fontSize="md" mb={3} textAlign="center">
            {t('auth.authFailure.message1')}
          </Text>
          <Text fontSize="md" textAlign="center">
            {t('auth.authFailure.message2')}
          </Text>
        </Modal>
        <Modal
          ref={emailCheckModal}
          hideAction={true}
          title={t('auth.authFailure.title')}
          callback={signOut}>
          <Text fontSize="md" mb={3} textAlign="center">
            {t('auth.emailCheck.message1')}
          </Text>
          <Text fontSize="md" textAlign="center">
            {t('auth.emailCheck.message2')}
          </Text>
        </Modal>
      </SafeAreaView>
    </Box>
  );
};

export default SignInView;
