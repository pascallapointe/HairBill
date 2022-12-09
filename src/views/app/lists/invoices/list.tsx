import React, { useEffect, useState } from 'react';
import {
  getInvoices,
  InvoiceType,
} from '@views/app/invoice/invoice.repository';
import { Button, FlatList, HStack, Icon, Text, VStack } from 'native-base';
import { createTimestamp } from '@lib/utils';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import Card from '@components/card';
import { useTranslation } from 'react-i18next';

const Item: React.FC<{
  item: InvoiceType;
  viewReceipt: (receipt: InvoiceType) => void;
}> = ({ item, viewReceipt }) => {
  return (
    <HStack py={2} borderBottomWidth={1} borderColor="muted.300">
      <Text
        w="80px"
        fontFamily="Menlo"
        fontSize="md"
        fontWeight="bold"
        color="muted.500">
        {item.invoiceNumber}
      </Text>
      <Text
        ml={4}
        w="160px"
        fontFamily="Menlo"
        fontSize="md"
        fontWeight="bold"
        color="muted.500">
        {createTimestamp(new Date(item.date))}
      </Text>
      <VStack ml={4} w={{ md: '210px', lg: '200px' }}>
        <Text
          isTruncated={true}
          fontSize="md"
          fontWeight="bold"
          color="fuchsia.600"
          textAlign="center">
          {item.client.name}
        </Text>
        <Text
          isTruncated={true}
          fontSize="sm"
          fontWeight="bold"
          color="muted.500"
          textAlign="center">
          {item.client.phone.length ? item.client.phone : ' '}
        </Text>
      </VStack>
      <HStack ml="auto">
        <Button
          onPress={() => viewReceipt(item)}
          ml={2}
          variant="outline"
          colorScheme="amber">
          <Icon as={FontAwesome5Icon} name="receipt" color="violet.400" />
        </Button>
        <Button ml={2} variant="outline" colorScheme="amber">
          <Icon as={FontAwesome5Icon} name="pen" color="yellow.500" />
        </Button>
        <Button ml={2} variant="outline" colorScheme="danger">
          <Icon as={FontAwesome5Icon} name="trash" />
        </Button>
      </HStack>
    </HStack>
  );
};

const InvoiceList: React.FC<{
  viewReceipt: (receipt: InvoiceType) => void;
}> = ({ viewReceipt }) => {
  const { t } = useTranslation();
  const [init, setInit] = useState(true);
  const [invoices, setInvoices] = useState<InvoiceType[]>([]);

  useEffect(() => {
    if (init) {
      getInvoices()
        .then(res => {
          setInvoices(res);
          setInit(false);
        })
        .catch(console.error);
    }
  }, []);

  return (
    <Card width="2xl" title={t<string>('invoice.invoices')}>
      <FlatList
        mb={2}
        maxHeight={{ md: '760px', lg: '520px' }}
        data={invoices}
        renderItem={({ item }) => (
          <Item item={item} viewReceipt={viewReceipt} />
        )}
      />
    </Card>
  );
};

export default InvoiceList;
