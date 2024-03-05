import React, { useRef, useState } from 'react';
import { Box, HStack } from 'native-base';
import { SafeAreaView } from 'react-native';
import TabButton from '@components/tab-button';
import { useTranslation } from 'react-i18next';
import ShowReceiptView, {
  ShowReceiptRefType,
} from '@app/main/lists/invoices/show-receipt-view';
import InvoiceList from '@app/main/lists/invoices/list';
import MenuView from '@app/main/lists/reports/menu-view';
import { NativeStackScreenProps } from 'react-native-screens/native-stack';
import { NavigatorParamList } from '@app/app-navigation';
import { InvoiceType } from '@app/main/invoice/invoice.repository';
import ClientList from '@app/main/lists/clients/list.tsx';

type View = 'invoices' | 'clients' | 'reports';

interface Props extends NativeStackScreenProps<NavigatorParamList, 'lists'> {}

const ListsView: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { refresh, settings } = route.params;
  const [view, setView] = useState<'invoices' | 'clients' | 'reports'>(
    'invoices',
  );
  const showReceiptRef = useRef<ShowReceiptRefType>(null);

  function viewReceipt(receipt: InvoiceType): void {
    showReceiptRef.current && showReceiptRef.current.viewReceipt(receipt);
  }

  function display(view: View) {
    switch (view) {
      case 'invoices':
        return (
          <>
            <InvoiceList
              refresh={refresh}
              navigation={navigation}
              viewReceipt={viewReceipt}
              settings={settings}
            />
            <ShowReceiptView ref={showReceiptRef} />
          </>
        );
      case 'clients':
        return <ClientList />;
      case 'reports':
        return <MenuView navigation={navigation} route={route} />;
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
        style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-start' }}>
        <HStack justifyContent="center" space={4} mt={5} mb={5}>
          <TabButton
            text={t<string>('invoice.invoices')}
            action={() => setView('invoices')}
            selected={view === 'invoices'}
          />
          <TabButton
            text={t<string>('lists.clients')}
            action={() => setView('clients')}
            selected={view === 'clients'}
          />
          <TabButton
            text={t<string>('lists.reports')}
            action={() => setView('reports')}
            selected={view === 'reports'}
          />
        </HStack>
        {display(view)}
      </SafeAreaView>
    </Box>
  );
};

export default ListsView;
