import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Center,
  HStack,
  Icon,
  ScrollView,
  Skeleton,
  Text,
  VStack,
} from 'native-base';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import Card from '@components/card';
import { useTranslation } from 'react-i18next';
import Modal, { ModalRef } from '@components/modal';
import TextInput, { InputRef } from '@components/form/text-input';
import ListItem from '@app/main/lists/clients/list-item';
import {
  addClient,
  ClientType,
  getClients,
  removeClient,
  updateClient,
} from '@app/main/invoice/client/client.repository.ts';
import EditClient from '@app/main/lists/clients/edit.tsx';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

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
        placeholder={t<string>('lists.clientSearchPlaceholder')}
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

const ClientList: React.FC = () => {
  const { t } = useTranslation();
  const [init, setInit] = useState(true);
  const [clients, setClients] = useState<ClientType[]>([]);
  const [filter, setFilter] = useState<string>('');

  // Modal
  const addModal = useRef<ModalRef>(null);
  const editModal = useRef<ModalRef>(null);
  const addNameField = useRef<InputRef>(null);
  const addPhoneField = useRef<InputRef>(null);
  const editNameField = useRef<InputRef>(null);
  const editPhoneField = useRef<InputRef>(null);
  const confirmModal = useRef<ModalRef>(null);
  const [clientTarget, setClientTarget] = useState<ClientType>({
    id: '',
    name: '',
    phone: '',
  });
  const errorModal = useRef<ModalRef>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    getClients()
      .then((c: ClientType[]) => {
        setClients(c);
        setInit(false);
      })
      .catch(e => {
        setErrorMessage(t<string>(e.message ?? 'exception.database'));
        errorModal.current && errorModal.current.open();
      });
  }, [init]);

  function resetClientTarget() {
    setClientTarget({ id: '', name: '', phone: '' });
  }

  function clear() {
    addNameField.current && addNameField.current.blur();
    addPhoneField.current && addPhoneField.current.blur();
    addNameField.current && addNameField.current.clearValue();
    addPhoneField.current && addPhoneField.current.clearValue();
    editNameField.current && editNameField.current.blur();
    editPhoneField.current && editPhoneField.current.blur();
    editNameField.current && editNameField.current.clearValue();
    editPhoneField.current && editPhoneField.current.clearValue();
  }

  function add() {
    const fields = [
      addNameField.current && addNameField.current.validate(),
      addPhoneField.current && addPhoneField.current.validate(),
    ];
    if (fields.every(field => field)) {
      try {
        const client = addClient({
          name: (addNameField.current && addNameField.current.getValue()) ?? '',
          phone:
            (addPhoneField.current && addPhoneField.current.getValue()) ?? '',
        });
        const list = [...clients];
        list.push(client);
        list.sort((a, b) => (a.name > b.name ? 1 : -1));
        setClients(list);
      } catch (e: any) {
        setErrorMessage(t<string>(e.message ?? 'exception.database'));
        errorModal.current && errorModal.current.open();
      }
      addModal.current && addModal.current.close();
      resetClientTarget();
    }
  }

  function edit(client: ClientType) {
    setClientTarget(client);
    editModal.current && editModal.current.open();
  }

  function doUpdateClient() {
    const fields = [
      editNameField.current && editNameField.current.validate(),
      editPhoneField.current && editPhoneField.current.validate(),
    ];
    if (fields.every(field => field)) {
      const updatedClient = {
        id: clientTarget.id,
        name: (editNameField.current && editNameField.current.getValue()) ?? '',
        phone:
          (editPhoneField.current && editPhoneField.current.getValue()) ?? '',
      };
      try {
        updateClient(updatedClient);
        const list = [...clients];
        const index = list.findIndex(item => item.id === clientTarget.id);
        list[index] = updatedClient;
        setClients(list);
      } catch (e: any) {
        setErrorMessage(t<string>(e.message ?? 'exception.database'));
        errorModal.current && errorModal.current.open();
      }
      editModal.current && editModal.current.close();
      resetClientTarget();
    }
  }

  function confirmDelete(client: ClientType): void {
    setClientTarget(client);
    confirmModal.current && confirmModal.current.open();
  }

  function deleteClient(): void {
    if (!clientTarget.id.length) {
      return;
    }

    try {
      removeClient(clientTarget.id);
      const list = [...clients];
      const index = list.findIndex(item => item.id === clientTarget.id);
      list.splice(index, 1);
      setClients(list);
    } catch (e: any) {
      setErrorMessage(t<string>(e.message ?? 'exception.database'));
      errorModal.current && errorModal.current.open();
    }
    resetClientTarget();
  }

  function displayFilteredItems() {
    let list: ClientType[];
    if (!filter.length) {
      list = [...clients];
    } else {
      const regex = new RegExp(filter, 'gi');
      list = clients.filter(
        ({ name, phone }) => name.match(regex) || phone.match(regex),
      );
    }

    return list.length ? (
      <>
        <ScrollView mb={2} maxHeight={{ md: '720px', lg: '480px' }}>
          {list.map(item => (
            <ListItem
              key={item.id}
              edit={edit}
              remove={confirmDelete}
              item={item}
            />
          ))}
        </ScrollView>
      </>
    ) : (
      <Box p={20} alignItems="center">
        <Text fontSize="lg" fontWeight="bold" color="muted.400">
          {t<string>('noResult')}
        </Text>
      </Box>
    );
  }

  if (init) {
    return <Loading title={t<string>('lists.clients')} />;
  }

  return (
    <Card
      width="2xl"
      title={t<string>('lists.clients')}
      options={
        <HStack>
          <Button
            mx={1}
            leftIcon={<Icon as={FontAwesomeIcon} name="plus" />}
            size="sm"
            colorScheme="lime"
            shadow={4}
            onPress={() => {
              addModal.current && addModal.current.open();
            }}>
            {t<string>('add')}
          </Button>
          <SearchBar search={setFilter} />
        </HStack>
      }>
      {displayFilteredItems()}
      <Modal
        ref={errorModal}
        hideAction={true}
        title={t('exception.operationFailed')}
        modalType="error">
        <Text fontSize="md" textAlign="center">
          {errorMessage}
        </Text>
      </Modal>
      <Modal
        ref={confirmModal}
        action={deleteClient}
        title={t('modal.confirmDelete')}
        actionBtnText={t<string>('delete')}
        closeBtnText={t<string>('cancel')}
        modalType="warning">
        <Text fontSize="md" textAlign="center">
          {t('modal.deleteMessage')}{' '}
          <Text fontWeight="bold" color="fuchsia.600">
            {clientTarget?.name}
          </Text>
        </Text>
        <Text italic={true} mt="20px" textAlign="center">
          {t('lists.clientDelete')}
        </Text>
      </Modal>
      <Modal
        ref={addModal}
        actionAutoClose={false}
        action={add}
        callback={clear}
        title={t('lists.addClientModal')}
        actionBtnText={t<string>('add')}
        closeBtnText={t<string>('cancel')}>
        <EditClient nameField={addNameField} phoneField={addPhoneField} />
      </Modal>
      <Modal
        ref={editModal}
        actionAutoClose={false}
        action={doUpdateClient}
        callback={clear}
        title={t('lists.editClientModal')}
        actionBtnText={t<string>('save')}
        closeBtnText={t<string>('cancel')}>
        <EditClient
          client={clientTarget}
          nameField={editNameField}
          phoneField={editPhoneField}
        />
      </Modal>
    </Card>
  );
};

export default ClientList;
