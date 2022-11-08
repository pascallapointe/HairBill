import React from 'react';
import { z } from 'zod';
import { Box, Heading, VStack } from 'native-base';
import { SafeAreaView } from 'react-native';
import Card from '@components/card';
import { useTranslation } from 'react-i18next';
import ZocialIcons from 'react-native-vector-icons/Zocial';
import TextInput from '@components/form/text-input';

const SignInView = () => {
  const { t } = useTranslation();

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
            {t('auth.WelcomeTo')}
          </Heading>
          <Card
            w="400px"
            title={t('auth.SignIn')}
            titleCenter={true}
            alignItems="center">
            <TextInput
              name="email"
              label={t<string>('auth.Email')}
              icon={<ZocialIcons name="email" />}
              placeholder={t<string>('auth.Email')}
              schema={z
                .string({ required_error: t('validation.Required') })
                .email({
                  message: t('validation.invalidEmail'),
                })}
            />
          </Card>
        </VStack>
      </SafeAreaView>
    </Box>
  );
};

export default SignInView;
