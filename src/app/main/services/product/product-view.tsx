import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import { Button, Icon } from 'native-base';
import Card from '@components/card';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import EditProduct from '@app/main/services/product/edit';
import ProductList from '@app/main/services/product/list';
import { ProductType } from '@app/main/services/product/product.repository';

export type ProductViewType = 'add' | 'update' | 'list';

const ProductView = () => {
  const { t } = useTranslation();
  const [view, setView] = useState<ProductViewType>('list');
  const [product, setProduct] = useState<ProductType>();

  function updateProduct(p: ProductType) {
    setProduct(p);
    setView('update');
  }

  function switchView() {
    switch (view) {
      case 'add':
        return <EditProduct setParentView={setView} />;
      case 'update':
        return <EditProduct product={product} setParentView={setView} />;
      default:
        return <ProductList onEdit={updateProduct} />;
    }
  }

  return (
    <Card
      maxHeight={{ md: '840px', lg: '570px' }}
      width="2xl"
      title={
        view === 'list'
          ? t<string>('services.products')
          : t<string>('services.addProduct')
      }
      options={
        view === 'list' ? (
          <Button
            onPress={() => setView('add')}
            endIcon={
              <Icon as={FontAwesome5Icon} name="plus" colorScheme="violet" />
            }
            colorScheme="violet"
            shadow={4}>
            {t('add')}
          </Button>
        ) : (
          <Button
            onPress={() => setView('list')}
            colorScheme="violet"
            startIcon={
              <Icon
                as={FontAwesome5Icon}
                name="chevron-left"
                colorScheme="violet"
              />
            }
            variant="outline">
            {t('back')}
          </Button>
        )
      }>
      {switchView()}
    </Card>
  );
};

export default ProductView;
