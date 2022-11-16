import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Center,
  HStack,
  Icon,
  ScrollView,
  Text,
} from 'native-base';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import {
  getCategories,
  removeCategory,
} from '@views/app/services/category/category';
import Modal, { ModalRef } from '@components/modal';
import { useTranslation } from 'react-i18next';

const NoCategories = () => {
  const { t } = useTranslation();
  return (
    <Center py={10}>
      <Text color="muted.500" fontSize="md">
        {t('services.noCategory')}
      </Text>
    </Center>
  );
};

const CategoryItem: React.FC<{
  item: { key: string; name: string };
  onDelete: (key: string) => void;
}> = ({ item, onDelete }) => (
  <Box
    borderBottomColor="muted.400"
    borderBottomStyle="solid"
    borderBottomWidth={1}
    py={3}>
    <HStack justifyContent="space-between">
      <Text fontSize="xl" fontWeight="bold" color="light.700">
        {item.name}
      </Text>
      <Button variant="unstyled" onPress={() => onDelete(item.key)}>
        <Icon as={FontAwesome5Icon} name="trash" />
      </Button>
    </HStack>
  </Box>
);

const CategoryList = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<{ key: string; name: string }[]>(
    [],
  );
  const confirmModal = useRef<ModalRef>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    key: string;
    name: string;
  } | null>(null);

  const errorModal = useRef<ModalRef>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((e: any) => {
        setErrorMessage(t<string>(e.message ?? 'exception.database'));
        errorModal.current && errorModal.current.open();
      });
  }, []);

  function confirmDelete(key: string) {
    setDeleteTarget(categories.find(item => item.key === key) ?? null);
    confirmModal.current && confirmModal.current.open();
  }

  async function deleteItem(key: string | undefined) {
    if (!key) {
      return;
    }

    try {
      await removeCategory(key);
      const list = [...categories];
      const index = list.findIndex(item => item.key === key);
      list.splice(index, 1);
      setCategories(list);
    } catch (e: any) {
      setErrorMessage(t<string>(e.message ?? 'exception.database'));
      errorModal.current && errorModal.current.open();
    }
  }

  if (!categories.length) {
    return (
      <>
        <NoCategories />
        <Modal
          ref={errorModal}
          hideAction={true}
          title={t('exception.operationFailed')}
          modalType="error">
          <Text fontSize="md" textAlign="center">
            {errorMessage}
          </Text>
        </Modal>
      </>
    );
  }

  return (
    <>
      <ScrollView maxHeight="400px">
        {categories.map(item => (
          <CategoryItem key={item.key} item={item} onDelete={confirmDelete} />
        ))}
      </ScrollView>
      <Modal
        ref={confirmModal}
        action={() => deleteItem(deleteTarget?.key)}
        title={t('modal.confirmDelete')}
        actionBtnText={t('delete')}
        closeBtnText={t('cancel')}
        modalType="warning">
        <Text fontSize="md" textAlign="center">
          {t('modal.deleteMessage')}{' '}
          <Text fontWeight="bold" color="fuchsia.600">
            {deleteTarget?.name}
          </Text>
        </Text>
      </Modal>
      <Modal
        ref={errorModal}
        hideAction={true}
        title={t('exception.operationFailed')}
        modalType="error">
        <Text fontSize="md" textAlign="center">
          {errorMessage}
        </Text>
      </Modal>
    </>
  );
};

export default CategoryList;
