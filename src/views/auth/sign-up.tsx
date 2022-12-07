import React, { useEffect, useRef, useState } from 'react';
import { z, ZodLiteral } from 'zod';
import { Box, Heading, KeyboardAvoidingView, Text, VStack } from 'native-base';
import { Platform, SafeAreaView } from 'react-native';
import Card from '@components/card';
import { useTranslation } from 'react-i18next';
import TextInput, { InputRef } from '@components/form/text-input';
import ZocialIcon from 'react-native-vector-icons/Zocial';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import Modal, { ModalRef } from '@components/modal';
import ActionButton from '@components/action-button';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { NavigationProp, ParamListBase } from '@react-navigation/native';

interface Props {
  navigation: NavigationProp<ParamListBase>;
}

const RegisterView: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const emailField = useRef<InputRef>(null);
  const [emailValue, setEmailValue] = useState('');
  const passwordField = useRef<InputRef>(null);
  const [passwordValue, setPasswordValue] = useState('');
  const confirmField = useRef<InputRef>(null);
  const [confirmValue, setConfirmValue] = useState('');
  const [wait, setWait] = useState(false);

  // Modals
  const successModal = useRef<ModalRef>(null);
  const usedEmailModal = useRef<ModalRef>(null);
  const errorModal = useRef<ModalRef>(null);

  useEffect(() => {
    if (confirmField.current) {
      confirmField.current.clearValue();
      confirmField.current.updateSchema(getConfirmSchema(passwordValue));
    }
  }, [passwordValue]);

  function getConfirmSchema(val: string): ZodLiteral<string> {
    const customErrorMap: z.ZodErrorMap = (issue, ctx) => {
      if (typeof ctx.data === 'undefined') {
        return { message: t<string>('validation.required') };
      }
      return { message: t<string>('validation.passwordMismatch') };
    };
    return z.literal(val ?? '', { errorMap: customErrorMap });
  }

  function signUp() {
    setWait(true);
    const fields = [
      emailField.current && emailField.current.validate(emailValue),
      passwordField.current && passwordField.current.validate(passwordValue),
      confirmField.current && confirmField.current.validate(confirmValue),
    ];
    if (fields.every(field => field)) {
      auth()
        .createUserWithEmailAndPassword(emailValue, passwordValue)
        .then((cred: FirebaseAuthTypes.UserCredential) => {
          cred.user.sendEmailVerification().catch(console.error);
          successModal.current && successModal.current.open();
          auth().signOut().catch(console.error);
        })
        .catch(e => {
          console.error(e);
          switch (e.code) {
            case 'auth/email-already-in-use':
              usedEmailModal.current && usedEmailModal.current.open();
              break;
            default:
              errorModal.current && errorModal.current.open();
          }
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
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'position' : 'height'}>
          <VStack space={4} alignItems="center">
            <Heading color="white" size="4xl" mb={4} fontFamily="SignPainter">
              &nbsp;Nouveau compte&nbsp;
            </Heading>
            <Card w="400px" titleAlign="center" alignItems="center">
              <VStack p={2} space={2} alignItems="center" minW="100%">
                <TextInput
                  ref={emailField}
                  bindValue={setEmailValue}
                  label={t<string>('auth.email')}
                  placeholder={t<string>('auth.emailPlaceholder')}
                  icon={<ZocialIcon name="email" />}
                  schema={z
                    .string({
                      required_error: t<string>('validation.required'),
                    })
                    .email({
                      message: t<string>('validation.invalidEmail'),
                    })}
                  clear="while-editing"
                  keyboardType="email-address"
                />
                <TextInput
                  ref={passwordField}
                  bindValue={setPasswordValue}
                  label={t<string>('auth.newPassword')}
                  placeholder={t<string>('auth.newPassword')}
                  icon={<FontAwesome5Icon name="key" />}
                  schema={z
                    .string()
                    .regex(
                      new RegExp(
                        '((?=.*\\d)|(?=.*\\W+))(?![.\\n])(?=.*[A-Z])(?=.*[a-z]).*$',
                      ),
                      t<string>('validation.passwordConstraint'),
                    )
                    .min(8, t<string>('validation.min', { count: 8 }))}
                  clear="while-editing"
                  secureTextEntry={true}
                />
                <TextInput
                  ref={confirmField}
                  bindValue={setConfirmValue}
                  label={t<string>('auth.confirmPassword')}
                  placeholder={t<string>('auth.confirmPassword')}
                  icon={<FontAwesome5Icon name="key" />}
                  schema={getConfirmSchema('')}
                  clear="while-editing"
                  secureTextEntry={true}
                />
                <ActionButton
                  m={2}
                  size="lg"
                  wait={wait}
                  text={t('auth.createAccount')}
                  colorScheme="violet"
                  action={signUp}
                />
              </VStack>
            </Card>
          </VStack>
          <Modal
            ref={successModal}
            hideClose={true}
            actionBtnText={t<string>('auth.backToSignIn')}
            callback={() => navigation.navigate('signIn')}
            title={t('auth.registerSuccess.title')}>
            <Text fontSize="md" textAlign="center" mb={3}>
              {t('auth.registerSuccess.message1', { email: emailValue })}
            </Text>
            <Text fontSize="md" textAlign="center">
              {t('auth.registerSuccess.message2')}
            </Text>
          </Modal>
          <Modal
            ref={usedEmailModal}
            hideAction={true}
            callback={() => setWait(false)}
            title={t('auth.registerFailure.title')}>
            <Text fontSize="md" textAlign="center">
              {t('auth.registerFailure.usedEmail')}
            </Text>
          </Modal>
          <Modal
            ref={errorModal}
            hideAction={true}
            callback={() => setWait(false)}
            title={t('auth.registerFailure.title')}>
            <Text fontSize="md" textAlign="center">
              {t('modal.defaultErrorMessage')}
            </Text>
          </Modal>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Box>
  );
};

export default RegisterView;
