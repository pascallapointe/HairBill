import React, { useEffect, useRef, useState } from 'react';
import {
  deleteNote,
  getFilteredInvoices,
  getInvoices,
  InvoiceType,
  RESULT_LIMIT,
  softDelete,
} from '@views/app/invoice/invoice.repository';
import {
  Box,
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
import TextAreaInput, { TextAreaRef } from '@components/form/text-area-input';
import Modal, { ModalRef } from '@components/modal';
import TextInput, { InputRef } from '@components/form/text-input';

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
  remove: (id: string, restore: boolean) => void;
  viewReceipt: (receipt: InvoiceType) => void;
}> = ({ navigation, item, viewReceipt, remove }) => {
  return (
    <HStack py={2} borderBottomWidth={1} borderColor="muted.300">
      <VStack w="240px">
        <HStack>
          <Text
            w="80px"
            fontFamily="Menlo"
            fontSize="md"
            fontWeight="bold"
            color={
              item.deletedAt
                ? 'red.500'
                : item.updatedAt
                ? 'purple.500'
                : 'muted.500'
            }>
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
        </HStack>
        {item.updatedAt && !item.deletedAt ? (
          <Text
            fontFamily="Menlo"
            fontSize="sm"
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
            fontSize="sm"
            fontWeight="bold"
            color="red.500">
            Del: {createTimestamp(new Date(item.deletedAt))}
          </Text>
        ) : (
          ''
        )}
        <Box
          flexDirection="row"
          display={
            (item.updatedAt && item.updateNote.length && !item.deletedAt) ||
            (item.deletedAt && item.deleteNote.length)
              ? 'flex'
              : 'none'
          }>
          <Text fontWeight="bold" color="muted.500">
            Note:
          </Text>
          <Text ml={1} color="muted.500">
            {item.deletedAt ? item.deleteNote : item.updateNote}
          </Text>
        </Box>
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
      <HStack ml="auto" maxH="45px">
        <Button
          onPress={() => viewReceipt(item)}
          ml={4}
          variant="outline"
          colorScheme="amber">
          <Icon
            as={FontAwesome5Icon}
            left="2px"
            name="receipt"
            color="violet.400"
          />
        </Button>
        <Button
          onPress={() => navigation.navigate('invoice', { invoice: item })}
          ml={2}
          variant="outline"
          colorScheme="amber">
          <Icon as={FontAwesome5Icon} name="pen" color="yellow.500" />
        </Button>
        <Button
          onPress={() =>
            item.id ? remove(item.id, item.deletedAt != null) : null
          }
          ml={2}
          variant="outline"
          colorScheme="danger">
          <Icon
            left={item.deletedAt != null ? '0px' : '1px'}
            as={FontAwesome5Icon}
            name={item.deletedAt ? 'recycle' : 'trash'}
            color={item.deletedAt ? 'lime.500' : 'muted.500'}
          />
        </Button>
      </HStack>
    </HStack>
  );
};

const SearchBar: React.FC<{ search: (v: string) => void }> = ({ search }) => {
  const { t } = useTranslation();
  const searchField = useRef<InputRef>(null);

  function handleSearch() {
    if (searchField.current) {
      const queryString = searchField.current.getValue();
      search(queryString);
    }
  }

  return (
    <HStack maxW="200px" mx={2}>
      <TextInput
        ref={searchField}
        autoCapitalize="words"
        placeholder={t<string>('lists.searchPlaceholder')}
        clear="while-editing"
        InputRightElement={
          <Button onPress={handleSearch} rounded="none" colorScheme="violet">
            <FontAwesome5Icon name="search" color="white" />
          </Button>
        }
      />
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
  const [query, setQuery] = useState('');
  const [invoices, setInvoices] = useState<InvoiceType[]>([]);
  const [endOfList, setEndOfList] = useState(false);

  // Modal
  const deleteModal = useRef<ModalRef>(null);
  const [deleteTarget, setDeleteTarget] = useState<string>('');
  const deleteNoteField = useRef<TextAreaRef>(null);

  useEffect(() => {
    if (init || refresh !== 0) {
      fetchInvoices();
    }
  }, [init, refresh]);

  function loadMore() {
    if (!endOfList && invoices.length) {
      fetchInvoices(invoices[invoices.length - 1].date);
    }
  }

  function loadMoreSearch() {
    if (!endOfList && invoices.length) {
      search(query, invoices[invoices.length - 1].date);
    }
  }

  function fetchInvoices(afterDate?: number) {
    getInvoices(afterDate)
      .then(res => {
        if (res.length < RESULT_LIMIT) {
          setEndOfList(true);
        }
        if (afterDate) {
          setInvoices([...invoices, ...res]);
        } else {
          setInvoices([...res]);
        }
        setInit(false);
      })
      .catch(console.error);
  }

  function search(queryString: string, afterDate?: number) {
    setQuery(queryString);
    setEndOfList(false);
    if (queryString.length) {
      getFilteredInvoices(queryString, afterDate)
        .then(res => {
          if (res.length < RESULT_LIMIT) {
            setEndOfList(true);
          }
          if (afterDate) {
            setInvoices([...invoices, ...res]);
          } else {
            setInvoices([...res]);
          }
          setInit(false);
        })
        .catch(console.error);
    } else {
      setInit(true);
    }
  }

  function remove(id: string, restore = false): void {
    softDelete(id, restore);
    if (!restore) {
      setDeleteTarget(id);
      deleteModal.current && deleteModal.current.open();
    } else {
      // Force refresh
      setInit(true);
    }
  }

  function saveRemoveNote() {
    if (deleteTarget.length && deleteNoteField.current) {
      deleteNote(deleteTarget, deleteNoteField.current.getValue());
    }
    // Force refresh
    setInit(true);
  }

  if (init) {
    return (
      <Card width="2xl" title={t<string>('invoice.invoices')}>
        <ScrollView maxHeight={{ md: '760px', lg: '520px' }}>
          {[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1].map((v, i) => (
            <Loading key={i} />
          ))}
        </ScrollView>
      </Card>
    );
  }

  return (
    <Card
      width="2xl"
      title={t<string>('invoice.invoices')}
      options={<SearchBar search={search} />}>
      <FlatList
        initialNumToRender={14}
        mb={2}
        maxHeight={{ md: '760px', lg: '520px' }}
        data={invoices}
        renderItem={({ item }) => (
          <Item
            key={item.id}
            navigation={navigation}
            remove={remove}
            item={item}
            viewReceipt={viewReceipt}
          />
        )}
        onEndReached={query.length ? loadMoreSearch : loadMore}
        onEndReachedThreshold={1.5}
      />
      <Modal
        ref={deleteModal}
        action={saveRemoveNote}
        hideClose={true}
        outClick={false}
        actionBtnText={t<string>('continue')}
        title={t('invoice.deleteNote')}
        modalType="warning">
        <TextAreaInput
          ref={deleteNoteField}
          required={false}
          label="Note"
          placeholder={t<string>('invoice.deleteNotePlaceholder')}
        />
      </Modal>
    </Card>
  );
};

export default InvoiceList;
