import React, { useEffect, useState } from 'react';
import { Box, Heading } from 'native-base';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native';
import Card from '@components/card';
import ClientInput from '@views/app/invoice/client/client-input';
import { ClientType } from '@views/app/invoice/client/client.repository';
import { z } from 'zod';

const InvoiceView = () => {
  const { t } = useTranslation();
  const [client, setClient] = useState<ClientType>({
    id: '',
    name: '',
    phone: '',
  });

  useEffect(() => console.log(client), [client]);

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
          <Box py={5} px={10}>
            <ClientInput
              label="Nom du client"
              bindValue={setClient}
              clear="while-editing"
              schema={z
                .string({
                  required_error: t<string>('validation.required'),
                })
                .min(3, { message: t<string>('validation.min', { count: 3 }) })}
            />
          </Box>
        </Card>
      </SafeAreaView>
    </Box>
  );
};

export default InvoiceView;
