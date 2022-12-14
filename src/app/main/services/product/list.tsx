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
  View,
  VStack,
} from 'native-base';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import Modal, { ModalRef } from '@components/modal';
import { useTranslation } from 'react-i18next';
import {
  buildSectionMap,
  getProducts,
  ProductSectionMapType,
  ProductType,
  removeProduct,
} from '@app/main/services/product/product.repository';

const NoProduct = () => {
  const { t } = useTranslation();
  return (
    <Center py={10}>
      <Text color="muted.500" fontSize="md">
        {t('services.noProduct')}
      </Text>
    </Center>
  );
};

const ProductItem: React.FC<{
  item: ProductType;
  onDelete: (key: string) => void;
  onEdit: (p: ProductType) => void;
}> = ({ item, onDelete, onEdit }) => {
  const { t } = useTranslation();

  return (
    <Box
      borderBottomColor="muted.400"
      borderBottomStyle="solid"
      borderBottomWidth={1}
      py={3}>
      <HStack justifyContent="space-between">
        <Flex top={1} direction="row">
          <Text fontSize="xl" fontWeight="bold" color="light.700">
            {item.name}
          </Text>
          <Text ml={4} fontSize="lg" fontWeight="bold" color="muted.500">
            {t('price', { price: item.price.toFixed(2) })}
          </Text>
        </Flex>

        <Flex direction="row">
          <Button
            ml={2}
            variant="outline"
            colorScheme="amber"
            onPress={() => onEdit(item)}>
            <Icon as={FontAwesome5Icon} name="pen" color="yellow.500" />
          </Button>
          <Button
            ml={2}
            variant="outline"
            colorScheme="danger"
            onPress={() => onDelete(item.id!)}>
            <Icon as={FontAwesome5Icon} name="trash" />
          </Button>
        </Flex>
      </HStack>
    </Box>
  );
};

const ProductList: React.FC<{ onEdit: (p: ProductType) => void }> = ({
  onEdit,
}) => {
  const { t } = useTranslation();
  const [init, setInit] = useState(true);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [sectionList, setSectionList] = useState<ProductSectionMapType>({});
  const confirmModal = useRef<ModalRef>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductType | null>(null);

  const errorModal = useRef<ModalRef>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    getProducts()
      .then(p => {
        setProducts(p);
        setSectionList(buildSectionMap(p, t<string>('services.noCategory')));
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
    setDeleteTarget(products.find(item => item.id === key) ?? null);
    confirmModal.current && confirmModal.current.open();
  }

  async function deleteItem(key: string | undefined) {
    if (!key) {
      return;
    }

    try {
      removeProduct(key);
      const list = [...products];
      const index = list.findIndex(item => item.id === key);
      list.splice(index, 1);
      setProducts(list);
      setSectionList(buildSectionMap(list, t<string>('services.noCategory')));
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
              <Skeleton w="40px" h="40px" startColor="violet.200" />
              <Skeleton ml={2} w="40px" h="40px" startColor="fuchsia.200" />
            </HStack>
          </Flex>
        ))}
      </VStack>
    );
  }

  if (!products.length) {
    return (
      <>
        <NoProduct />
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
        {Object.keys(sectionList).map(key => (
          <View key={key}>
            {sectionList[key].products.length ? (
              <Text
                fontSize="lg"
                fontWeight="bold"
                mt={4}
                color={key === 'none' ? 'muted.400' : 'pink.500'}>
                {sectionList[key].name}
              </Text>
            ) : (
              ''
            )}
            {sectionList[key].products.map(item => (
              <ProductItem
                key={item.id}
                item={item}
                onDelete={confirmDelete}
                onEdit={onEdit}
              />
            ))}
          </View>
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

export default ProductList;
