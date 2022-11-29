import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Center,
  HStack,
  Icon,
  Pressable,
  ScrollView,
  Skeleton,
  Text,
  VStack,
} from 'native-base';
import {
  ClientType,
  getClients,
  removeClient,
} from '@views/app/invoice/client/client.repository';
import { useTranslation } from 'react-i18next';
import Modal, { ModalRef } from '@components/modal';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';

const ListItem: React.FC<{
  item: ClientType;
  bindClient: (client: ClientType) => void;
  onDelete: (id: string) => void;
}> = ({ item, bindClient, onDelete }) => {
  return (
    <Pressable
      pl={4}
      pr={1}
      rounded={5}
      colorScheme="fuchsia"
      _pressed={{
        bg: 'fuchsia.100',
      }}
      onPress={() => bindClient(item)}>
      <HStack justifyContent="space-between">
        <Text
          isTruncated={true}
          maxW={{ md: '250px', lg: '400px' }}
          top="5px"
          fontSize="lg"
          fontWeight="bold"
          color="purple.800">
          {item.name}
        </Text>
        <HStack>
          <Text
            isTruncated={true}
            maxW={{ md: '140px', lg: '180px' }}
            top="5px"
            fontSize="lg"
            color="muted.500">
            {item.phone}
          </Text>
          <Button
            ml={4}
            variant="ghost"
            colorScheme="danger"
            onPress={() => onDelete(item.id!)}>
            <Icon as={FontAwesome5Icon} name="trash" />
          </Button>
        </HStack>
      </HStack>
    </Pressable>
  );
};

const ClientList: React.FC<{
  setView: (view: 'list' | 'add') => void;
  bindClient: (client: ClientType) => void;
  query: string;
}> = ({ setView, query, bindClient }) => {
  const { t } = useTranslation();
  const [clients, setClients] = useState<ClientType[]>([]);
  const [filtered, setFiltered] = useState<ClientType[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ClientType | null>(null);

  // Modals
  const errorModal = useRef<ModalRef>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const confirmModal = useRef<ModalRef>(null);

  useEffect(() => {
    setLoading(true);
    getClients()
      .then((c: ClientType[]) => {
        setClients(c);
        setLoading(false);
      })
      .catch(e => {
        setErrorMessage(t<string>(e.message ?? 'exception.database'));
        errorModal.current && errorModal.current.open();
      });
  }, []);

  useEffect(() => {
    if (!query.length) {
      return setFiltered(clients);
    }
    const regex = new RegExp(query, 'gi');
    setFiltered(clients.filter(({ name }) => name.match(regex)));
  }, [clients, query]);

  function confirmDelete(key: string) {
    setDeleteTarget(clients.find(item => item.id === key) ?? null);
    confirmModal.current && confirmModal.current.open();
  }

  async function deleteItem(id: string | undefined) {
    if (!id) {
      return;
    }

    try {
      await removeClient(id);
      const list = [...clients];
      const index = list.findIndex(item => item.id === id);
      list.splice(index, 1);
      setClients(list);
    } catch (e: any) {
      setErrorMessage(t<string>(e.message ?? 'exception.database'));
      errorModal.current && errorModal.current.open();
    }
  }

  if (loading) {
    return (
      <VStack px={12} py={5} space={2} height="250px">
        <Skeleton w="100%" h={8} rounded={4} />
        <Skeleton w="100%" h={8} rounded={4} />
        <Skeleton w="100%" h={8} rounded={4} />

        <Center>
          <Skeleton w="140px" h={10} />
        </Center>
      </VStack>
    );
  }

  if (!filtered.length) {
    return (
      <Box height="250px" justifyContent="center" alignItems="center">
        <Text mb={5} fontSize="lg" color="muted.500">
          {t<string>('invoice.noMatch')}
        </Text>
        <Button
          onPress={() => setView('add')}
          my={1}
          colorScheme="lime"
          shadow={4}>
          {t<string>('invoice.addClient')}
        </Button>
        <Modal
          ref={errorModal}
          hideAction={true}
          title={t('exception.operationFailed')}
          modalType="error">
          <Text fontSize="md" textAlign="center">
            {errorMessage}
          </Text>
        </Modal>
      </Box>
    );
  }

  return (
    <VStack pl={8} pr={12} pt={2} height="250px">
      <ScrollView keyboardShouldPersistTaps="always">
        {filtered.map(client => (
          <ListItem
            key={client.id}
            item={client}
            bindClient={bindClient}
            onDelete={confirmDelete}
          />
        ))}
      </ScrollView>

      <Center>
        <Button
          onPress={() => setView('add')}
          my={2}
          colorScheme="lime"
          shadow={4}>
          {t<string>('invoice.addClient')}
        </Button>
      </Center>
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
        action={() => deleteItem(deleteTarget?.id)}
        title={t('modal.confirmDelete')}
        actionBtnText={t<string>('delete')}
        closeBtnText={t<string>('cancel')}
        modalType="warning">
        <Text fontSize="md" textAlign="center">
          {t('modal.deleteMessage')}{' '}
          <Text fontWeight="bold" color="fuchsia.600">
            {deleteTarget?.name}
          </Text>
        </Text>
      </Modal>
    </VStack>
  );
};

export default ClientList;
