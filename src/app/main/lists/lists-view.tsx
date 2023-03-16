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

interface Props extends NativeStackScreenProps<NavigatorParamList, 'lists'> {}

const ListsView: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { refresh, settings } = route.params;
  const [view, setView] = useState<'invoices' | 'reports'>('invoices');
  const showReceiptRef = useRef<ShowReceiptRefType>(null);

  function viewReceipt(receipt: InvoiceType): void {
    showReceiptRef.current && showReceiptRef.current.viewReceipt(receipt);
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
        {view === 'invoices' ? (
          <>
            <InvoiceList
              refresh={refresh}
              navigation={navigation}
              viewReceipt={viewReceipt}
              settings={settings}
            />
            <ShowReceiptView ref={showReceiptRef} />
          </>
        ) : (
          <MenuView navigation={navigation} route={route} />
        )}
      </SafeAreaView>
    </Box>
  );
};

export default ListsView;
