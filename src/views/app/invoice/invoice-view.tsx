import React from 'react';
import { Box, Heading, Text } from 'native-base';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native';
import Card from '@components/card';

const InvoiceView = () => {
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
          &nbsp;{t<string>('invoice.title')}&nbsp;
        </Heading>
        <Card width={{ md: '700px', lg: '1000px' }} py={4}>
          <Text>Nouvelle facture</Text>
        </Card>
      </SafeAreaView>
    </Box>
  );
};

export default InvoiceView;
