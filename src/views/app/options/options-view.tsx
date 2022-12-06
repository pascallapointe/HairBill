import React, { useState } from 'react';
import { Box, Heading, HStack, KeyboardAvoidingView } from 'native-base';
import { Platform, SafeAreaView } from 'react-native';
import Card from '@components/card';
import { useTranslation } from 'react-i18next';

import SalesTaxView from '@views/app/options/sales-tax/sales-tax-view';
import GeneralView from '@views/app/options/general/general-view';
import TabButton from '@components/tab-button';

const OptionsView = () => {
  const { t } = useTranslation();
  const [view, setView] = useState<'general' | 'tax'>('general');
  return (
    <Box
      p={5}
      flex={1}
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
          <Heading
            color="white"
            size="4xl"
            mb={4}
            fontFamily="SignPainter"
            textAlign="center">
            &nbsp;Options&nbsp;
          </Heading>
          <Card
            width={{ md: '700px', lg: '1000px' }}
            title={t<string>('options.appSettings')}
            pb={4}>
            <HStack justifyContent="center" space={4} pb={4}>
              <TabButton
                text={t<string>('general')}
                action={() => setView('general')}
                selected={view === 'general'}
              />
              <TabButton
                text={t<string>('tax')}
                action={() => setView('tax')}
                selected={view === 'tax'}
              />
            </HStack>
            {view === 'general' ? <GeneralView /> : <SalesTaxView />}
          </Card>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Box>
  );
};

export default OptionsView;
