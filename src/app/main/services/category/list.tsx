import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Center,
  Divider,
  Flex,
  HStack,
  Icon,
  ScrollView,
  Skeleton,
  Text,
  VStack,
} from 'native-base';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import {
  CategoryType,
  getCategories,
  removeCategory,
} from '@app/main/services/category/category.repository';
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
  item: CategoryType;
  onDelete: (key: string) => void;
}> = ({ item, onDelete }) => (
  <Box
    borderBottomColor="muted.400"
    borderBottomStyle="solid"
    borderBottomWidth={1}
    py={3}>
    <HStack justifyContent="space-between">
      <Text top={1} fontSize="xl" fontWeight="bold" color="light.700">
        {item.name}
      </Text>
      <Button
        ml={2}
        variant="outline"
        colorScheme="danger"
        onPress={() => onDelete(item.id!)}>
        <Icon as={FontAwesome5Icon} name="trash" />
      </Button>
    </HStack>
  </Box>
);

const CategoryList = () => {
  const { t } = useTranslation();
  const [init, setInit] = useState(true);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<CategoryType | null>(null);

  // Modals
  const errorModal = useRef<ModalRef>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const confirmModal = useRef<ModalRef>(null);

  useEffect(() => {
    getCategories()
      .then(cat => {
        setCategories(cat);
        if (init) {
          setInit(false);
        }
      })
      .catch((e: any) => {
        setErrorMessage(t<string>(e.message ?? 'exception.database'));
        errorModal.current && errorModal.current.open();
      });
  }, []);

  function confirmDelete(key: string) {
    setDeleteTarget(categories.find(item => item.id === key) ?? null);
    confirmModal.current && confirmModal.current.open();
  }

  async function deleteItem(key: string | undefined) {
    if (!key) {
      return;
    }

    try {
      removeCategory(key);
      const list = [...categories];
      const index = list.findIndex(item => item.id === key);
      list.splice(index, 1);
      setCategories(list);
    } catch (e: any) {
      setErrorMessage(t<string>(e.message ?? 'exception.database'));
      errorModal.current && errorModal.current.open();
    }
  }

  if (init) {
    return (
      <VStack divider={<Divider bgColor="muted.400" />}>
        {[1, 2, 3].map(key => (
          <Flex key={key} my={2} direction="row" justifyContent="space-between">
            <Skeleton w="150px" top={1} h="30px" />
            <HStack>
              <Skeleton ml={2} w="40px" h="40px" startColor="fuchsia.200" />
            </HStack>
          </Flex>
        ))}
      </VStack>
    );
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
      <ScrollView maxHeight={{ md: '760px', lg: '500px' }}>
        {categories.map(item => (
          <CategoryItem key={item.id} item={item} onDelete={confirmDelete} />
        ))}
      </ScrollView>
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
