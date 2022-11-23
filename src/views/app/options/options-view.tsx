import React from 'react';
import { Box, Heading } from 'native-base';
import { SafeAreaView } from 'react-native';
import Card from '@components/card';
import { useTranslation } from 'react-i18next';

import SalesTaxView from '@views/app/options/sales-tax/sales-tax-view';

const OptionsView = () => {
  const { t } = useTranslation();
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
        <Heading color="white" size="4xl" mb={4} fontFamily="SignPainter">
          &nbsp;Options&nbsp;
        </Heading>
        <Card
          width={{ md: '700px', lg: '1000px' }}
          title={t<string>('options.appSettings')}
          pb={4}>
          <SalesTaxView />
        </Card>
      </SafeAreaView>
    </Box>
  );
};

export default OptionsView;
