import React, { useEffect, useRef, useState } from 'react';
import { Box, HStack } from 'native-base';
import { SafeAreaView } from 'react-native';
import TabButton from '@components/tab-button';
import { useTranslation } from 'react-i18next';
import ShowReceiptView, {
  ShowReceiptRefType,
} from '@views/app/lists/invoices/show-receipt-view';
import {
  defaultGeneralSettings,
  defaultTaxSettings,
  getTaxSettings,
  TaxSettingsType,
} from '@views/app/options/sales-tax/sales-tax.repository';
import {
  GeneralSettingsType,
  getGeneralSettings,
} from '@views/app/options/general/general.repository';
import InvoiceList from '@views/app/lists/invoices/list';
import { NativeStackScreenProps } from 'react-native-screens/native-stack';
import { NavigatorParamList } from '@views/app-navigation';

interface Props extends NativeStackScreenProps<NavigatorParamList, 'lists'> {}

const ListsView: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const [init, setInit] = useState(true);
  const { refresh } = route.params;
  const [view, setView] = useState<'invoices' | 'reports'>('invoices');
  const showReceiptRef = useRef<ShowReceiptRefType>(null);
  const [taxSettings, setTaxSettings] =
    useState<TaxSettingsType>(defaultTaxSettings);
  const [generalSettings, setGeneralSettings] = useState<GeneralSettingsType>(
    defaultGeneralSettings,
  );

  useEffect(() => {
    if (init) {
      getGeneralSettings().then(val => val && setGeneralSettings(val));
      getTaxSettings().then(val => {
        if (val) {
          setTaxSettings(val);
        }
        setInit(false);
      });
    }
  }, []);

  function switchView() {
    switch (view) {
      case 'invoices':
        return (
          <InvoiceList
            refresh={refresh}
            navigation={navigation}
            viewReceipt={
              showReceiptRef.current
                ? showReceiptRef.current.viewReceipt
                : () => null
            }
          />
        );
    }
  }

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
        {switchView()}
        <ShowReceiptView
          ref={showReceiptRef}
          generalSettings={generalSettings}
          taxSettings={taxSettings}
        />
      </SafeAreaView>
    </Box>
  );
};

export default ListsView;
