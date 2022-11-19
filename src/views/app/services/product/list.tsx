import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Center,
  Flex,
  HStack,
  Icon,
  ScrollView,
  Text,
} from 'native-base';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import Modal, { ModalRef } from '@components/modal';
import { useTranslation } from 'react-i18next';
import {
  getProducts,
  ProductType,
  removeProduct,
} from '@views/app/services/product/product.repository';
import {
  CategoryType,
  getCategories,
} from '@views/app/services/category/category.repository';

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
          <Button ml={2} variant="outline" onPress={() => onEdit(item)}>
            <Icon as={FontAwesome5Icon} name="pen" color="yellow.500" />
          </Button>
          <Button ml={2} variant="outline" onPress={() => onDelete(item.key!)}>
            <Icon as={FontAwesome5Icon} name="trash" />
          </Button>
        </Flex>
      </HStack>
    </Box>
  );
};

type SectionType = {
  name: string;
  products: ProductType[];
};

type SectionListType = {
  [key: string]: SectionType;
};

const ProductList: React.FC<{ onEdit: (p: ProductType) => void }> = ({
  onEdit,
}) => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<ProductType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [sectionList, setSectionList] = useState<SectionListType>({});
  const confirmModal = useRef<ModalRef>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductType | null>(null);

  const errorModal = useRef<ModalRef>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((e: any) => {
        setErrorMessage(t<string>(e.message ?? 'exception.database'));
        errorModal.current && errorModal.current.open();
      });
    getProducts()
      .then(setProducts)
      .catch((e: any) => {
        setErrorMessage(t<string>(e.message ?? 'exception.database'));
        errorModal.current && errorModal.current.open();
      });
  }, []);

  useEffect(() => {
    const list: SectionListType = {
      none: { name: t('services.noCategory'), products: [] },
    };

    // Insert categories
    for (const category of categories) {
      list[category.key] = { name: category.name, products: [] };
    }
    // Insert products
    for (const product of products) {
      if (product.category && !list[product.category.key]) {
        list[product.category.key] = {
          name: product.category.name,
          products: [],
        };
      }
      list[product.category ? product.category.key : 'none'].products.push(
        product,
      );
    }

    setSectionList(list);
  }, [products, categories]);

  function confirmDelete(key: string) {
    setDeleteTarget(products.find(item => item.key === key) ?? null);
    confirmModal.current && confirmModal.current.open();
  }

  async function deleteItem(key: string | undefined) {
    if (!key) {
      return;
    }

    try {
      await removeProduct(key);
      const list = [...products];
      const index = list.findIndex(item => item.key === key);
      list.splice(index, 1);
      setProducts(list);
    } catch (e: any) {
      setErrorMessage(t<string>(e.message ?? 'exception.database'));
      errorModal.current && errorModal.current.open();
    }
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
      <ScrollView maxHeight={{ md: '380px', lg: '500px' }}>
        {Object.keys(sectionList).map(key => (
          <>
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
                key={item.key}
                item={item}
                onDelete={confirmDelete}
                onEdit={onEdit}
              />
            ))}
          </>
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

export default ProductList;
