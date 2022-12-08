import React, { useState } from 'react';
import { Box, HStack, KeyboardAvoidingView } from 'native-base';
import { Platform, SafeAreaView } from 'react-native';
import TabButton from '@components/tab-button';
import { useTranslation } from 'react-i18next';

const ListsView = () => {
  const { t } = useTranslation();
  const [view, setView] = useState<'invoices' | 'reports'>('invoices');
  return (
    <Box
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
          <HStack justifyContent="center" space={4} mb={5}>
            <TabButton
              text={t<string>('invoice.invoices')}
              action={() => setView('invoices')}
              selected={view === 'invoices'}
            />
            <TabButton
              text={t<string>('lists.reports')}
              action={() => setView('reports')}
              selected={view === 'reports'}
            />
          </HStack>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Box>
  );
};

export default ListsView;
