import React, { useEffect, useRef, useState } from 'react';
import {
  deleteNote,
  getFilteredInvoices,
  getInvoicesAfter,
  InvoiceType,
  RESULT_LIMIT,
  softDelete,
} from '@app/main/invoice/invoice.repository';
import {
  Box,
  Button,
  Center,
  HStack,
  ScrollView,
  Skeleton,
  Text,
  VStack,
} from 'native-base';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import Card from '@components/card';
import { useTranslation } from 'react-i18next';
import { ParamListBase } from '@react-navigation/native';
import { NativeStackNavigationProp } from 'react-native-screens/src/native-stack/types';
import TextAreaInput, { TextAreaRef } from '@components/form/text-area-input';
import Modal, { ModalRef } from '@components/modal';
import TextInput, { InputRef } from '@components/form/text-input';
import ActionButton from '@components/action-button';
import ListItem from '@app/main/lists/invoices/list-item';
import { SettingsType } from '@app/main/menu';
import Filters, { FilterType } from '@app/main/lists/invoices/list/filters';

const LoadingItem = () => {
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

const Loading: React.FC<{ title: string }> = ({ title }) => {
  return (
    <Card width="2xl" title={title}>
      <Box overflow="hidden" maxHeight={{ md: '720px', lg: '480px' }}>
        {[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1].map((v, i) => (
          <LoadingItem key={i} />
        ))}
      </Box>
      <Center my={2}>
        <Skeleton w="80px" h="40px" rounded={4} startColor="violet.200" />
      </Center>
    </Card>
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
  settings: SettingsType;
  refresh: number;
}

const InvoiceList: React.FC<Props> = ({
  viewReceipt,
  navigation,
  settings,
  refresh,
}) => {
  const { t } = useTranslation();
  const [init, setInit] = useState(true);
  const [query, setQuery] = useState('');
  const [invoices, setInvoices] = useState<InvoiceType[]>([]);
  const [endOfList, setEndOfList] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');

  // Modal
  const deleteModal = useRef<ModalRef>(null);
  const [deleteTarget, setDeleteTarget] = useState<string>('');
  const deleteNoteField = useRef<TextAreaRef>(null);

  useEffect(() => {
    fetchInvoices().catch(console.error);
  }, [init, refresh, filter]);

  async function loadMore() {
    if (!endOfList && invoices.length) {
      await fetchInvoices(invoices[invoices.length - 1].date);
    }
    return false;
  }

  async function loadMoreSearch(): Promise<boolean> {
    if (!endOfList && invoices.length) {
      await search(query, invoices[invoices.length - 1].date);
    }
    return false;
  }

  async function fetchInvoices(afterDate?: number) {
    try {
      const result = await getInvoicesAfter(filter, afterDate);
      if (result.length < RESULT_LIMIT) {
        setEndOfList(true);
      }
      if (afterDate) {
        setInvoices([...invoices, ...result]);
      } else {
        setInvoices([...result]);
      }
      setInit(false);
    } catch (e) {
      console.error(e);
    }
  }

  async function search(queryString: string, afterDate?: number) {
    setQuery(queryString);
    setEndOfList(false);
    if (queryString.length) {
      try {
        const result = await getFilteredInvoices(
          queryString,
          filter,
          afterDate,
        );
        if (result.length < RESULT_LIMIT) {
          setEndOfList(true);
        }
        if (afterDate) {
          setInvoices([...invoices, ...result]);
        } else {
          setInvoices([...result]);
        }
        setInit(false);
      } catch (e) {
        console.error(e);
      }
    } else {
      setInit(true);
    }
  }

  function edit(invoice: InvoiceType) {
    navigation.navigate('invoice', { invoice: invoice, settings });
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

  function changeFilter(f: FilterType) {
    setInit(true);
    setFilter(f);
  }

  if (init) {
    return <Loading title={t<string>('invoice.invoices')} />;
  }

  return (
    <Card
      width="2xl"
      title={t<string>('invoice.invoices')}
      options={
        <HStack>
          <Filters value={filter} setFilter={changeFilter} />
          <SearchBar search={search} />
        </HStack>
      }>
      {invoices.length ? (
        <>
          <ScrollView mb={2} maxHeight={{ md: '720px', lg: '480px' }}>
            {invoices.map(item => (
              <ListItem
                key={item.id}
                edit={edit}
                remove={remove}
                item={item}
                viewReceipt={viewReceipt}
              />
            ))}
          </ScrollView>
          <Center my={2} display={endOfList ? 'none' : 'flex'}>
            <ActionButton
              text={t<string>('more')}
              action={query.length ? loadMoreSearch : loadMore}
            />
          </Center>
        </>
      ) : (
        <Box p={20} alignItems="center">
          <Text fontSize="lg" fontWeight="bold" color="muted.400">
            {t<string>('noResult')}
          </Text>
        </Box>
      )}

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
