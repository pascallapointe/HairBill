import React, { useEffect, useState } from 'react';
import {
  getInvoices,
  InvoiceType,
  softDelete,
} from '@views/app/invoice/invoice.repository';
import {
  Button,
  FlatList,
  HStack,
  Icon,
  ScrollView,
  Skeleton,
  Text,
  VStack,
} from 'native-base';
import { createTimestamp } from '@lib/utils';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import Card from '@components/card';
import { useTranslation } from 'react-i18next';
import { ParamListBase } from '@react-navigation/native';
import { NativeStackNavigationProp } from 'react-native-screens/src/native-stack/types';

const Loading = () => {
  return (
    <HStack py={2} borderBottomWidth={1} borderColor="muted.300">
      <Skeleton w="80px" h="20px" />
      <Skeleton ml={4} w="160px" h="20px" />
      <VStack ml={4} w={{ md: '200px', lg: '200px' }} alignItems="center">
        <Skeleton w="200px" h="20px" />
        <Skeleton mt={1} w="150px" h="20px" />
      </VStack>
      <HStack ml="auto">
        <Skeleton ml={4} w="40px" h="40px" startColor="violet.200" />
        <Skeleton ml={2} w="40px" h="40px" startColor="amber.200" />
        <Skeleton ml={2} w="40px" h="40px" startColor="fuchsia.200" />
      </HStack>
    </HStack>
  );
};

const Item: React.FC<{
  navigation: NativeStackNavigationProp<ParamListBase, 'lists'>;
  item: InvoiceType;
  remove: (id: string) => void;
  viewReceipt: (receipt: InvoiceType) => void;
}> = ({ navigation, item, viewReceipt, remove }) => {
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
      <VStack ml={4} w="160px">
        <Text
          fontFamily="Menlo"
          fontSize="md"
          fontWeight="bold"
          color="muted.500">
          {createTimestamp(new Date(item.date))}
        </Text>
        {item.updatedAt && !item.deletedAt ? (
          <Text
            fontFamily="Menlo"
            fontSize="xs"
            fontWeight="bold"
            color="purple.500">
            Mod: {createTimestamp(new Date(item.updatedAt))}
          </Text>
        ) : (
          ''
        )}
        {item.deletedAt ? (
          <Text
            fontFamily="Menlo"
            fontSize="xs"
            fontWeight="bold"
            color="red.500">
            Del: {createTimestamp(new Date(item.deletedAt))}
          </Text>
        ) : (
          ''
        )}
      </VStack>
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
          ml={4}
          variant="outline"
          colorScheme="amber">
          <Icon as={FontAwesome5Icon} name="receipt" color="violet.400" />
        </Button>
        <Button
          onPress={() => navigation.navigate('invoice', { invoice: item })}
          ml={2}
          variant="outline"
          colorScheme="amber">
          <Icon as={FontAwesome5Icon} name="pen" color="yellow.500" />
        </Button>
        <Button
          onPress={() => (item.id ? remove(item.id) : null)}
          ml={2}
          variant="outline"
          colorScheme="danger">
          <Icon as={FontAwesome5Icon} name="trash" />
        </Button>
      </HStack>
    </HStack>
  );
};

interface Props {
  navigation: NativeStackNavigationProp<ParamListBase, 'lists'>;
  viewReceipt: (receipt: InvoiceType) => void;
  refresh: number;
}

const InvoiceList: React.FC<Props> = ({ viewReceipt, navigation, refresh }) => {
  const { t } = useTranslation();
  const [init, setInit] = useState(true);
  const [invoices, setInvoices] = useState<InvoiceType[]>([]);

  useEffect(() => {
    if (init || refresh !== 0) {
      getInvoices()
        .then(res => {
          setInvoices(res);
          setInit(false);
        })
        .catch(console.error);
    }
  }, [init, refresh]);

  function remove(id: string): void {
    softDelete(id);
    // Force refresh
    setInit(true);
  }

  if (init) {
    return (
      <Card width="2xl" title={t<string>('invoice.invoices')}>
        <ScrollView maxHeight={{ md: '760px', lg: '520px' }}>
          {[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1].map(() => (
            <Loading />
          ))}
        </ScrollView>
      </Card>
    );
  }

  return (
    <Card width="2xl" title={t<string>('invoice.invoices')}>
      <FlatList
        initialNumToRender={14}
        mb={2}
        maxHeight={{ md: '760px', lg: '520px' }}
        data={invoices}
        renderItem={({ item }) => (
          <Item
            navigation={navigation}
            remove={remove}
            item={item}
            viewReceipt={viewReceipt}
          />
        )}
      />
    </Card>
  );
};

export default InvoiceList;
