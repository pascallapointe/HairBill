import React, { useState } from 'react';
import {
  Box,
  Button,
  Heading,
  HStack,
  KeyboardAvoidingView,
} from 'native-base';
import { Platform, SafeAreaView } from 'react-native';
import Card from '@components/card';
import { useTranslation } from 'react-i18next';

import SalesTaxView from '@views/app/options/sales-tax/sales-tax-view';
import GeneralView from '@views/app/options/general/general-view';

const TabBtn: React.FC<{
  text: string;
  action: () => void;
  selected: boolean;
}> = ({ text, action, selected }) => {
  const fontWeight = selected ? 'bold' : 'normal';
  return (
    <Button
      minW="100px"
      onPress={action}
      colorScheme={selected ? 'lime' : 'muted'}
      rounded={20}
      _text={{ fontWeight: fontWeight }}
      opacity={selected ? 1 : 0.6}
      shadow={selected ? 0 : 5}>
      {text}
    </Button>
  );
};

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
          <Heading color="white" size="4xl" mb={4} fontFamily="SignPainter">
            &nbsp;Options&nbsp;
          </Heading>
          <Card
            width={{ md: '700px', lg: '1000px' }}
            title={t<string>('options.appSettings')}
            pb={4}>
            <HStack justifyContent="center" space={4} pb={4}>
              <TabBtn
                text={t<string>('general')}
                action={() => setView('general')}
                selected={view === 'general'}
              />
              <TabBtn
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
