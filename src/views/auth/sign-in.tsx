import React, { useRef } from 'react';
import { z } from 'zod';
import { Box, Button, Heading, VStack } from 'native-base';
import { SafeAreaView } from 'react-native';
import Card from '@components/card';
import { useTranslation } from 'react-i18next';
import ZocialIcon from 'react-native-vector-icons/Zocial';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import TextInput from '@components/form/text-input';

const SignInView = () => {
  const { t } = useTranslation();
  const emailField = useRef(null);
  const passwordField = useRef(null);
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
            titleCenter={true}
            alignItems="center">
            <TextInput
              ref={emailField}
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
            <Button shadow={5}>Sign In</Button>
          </Card>
        </VStack>
      </SafeAreaView>
    </Box>
  );
};

export default SignInView;
