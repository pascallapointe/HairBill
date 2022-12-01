import React, { useState } from 'react';
import {
  ProductSectionMapType,
  ProductType,
} from '@views/app/services/product/product.repository';
import { Button, Center, Flex, ScrollView, Text } from 'native-base';
import { useTranslation } from 'react-i18next';

const OptionsPicker: React.FC<{
  options: ProductSectionMapType;
  select: (selected: ProductType) => void;
}> = ({ options, select }) => {
  const { t } = useTranslation();
  const [view, setView] = useState<'category' | 'product'>('category');
  const [subset, setSubset] = useState<ProductType[]>([]);

  function selectCategory(products: ProductType[]) {
    setSubset(products);
    setView('product');
  }

  if (view === 'category') {
    return (
      <ScrollView maxHeight={{ md: '270px', lg: '360px' }}>
        <Flex my={2} direction="row" wrap="wrap" justifyContent="center">
          {Object.keys(options).map(key =>
            options[key].products.length ? (
              <Button
                key={key}
                m={1}
                py={1}
                size="sm"
                onPress={() => selectCategory(options[key].products)}
                rounded={15}
                _text={{ fontWeight: 'bold', fontSize: 'sm' }}
                colorScheme="fuchsia"
                shadow={2}>
                {options[key].name}
              </Button>
            ) : (
              ''
            ),
          )}
        </Flex>
      </ScrollView>
    );
  }

  return (
    <ScrollView maxHeight={{ md: '270px', lg: '360px' }}>
      <Flex my={2} direction="row" wrap="wrap" justifyContent="center">
        {subset.map(option => (
          <Button
            key={option.id}
            m={1}
            py={1}
            size="sm"
            onPress={() => select(option)}
            rounded={15}
            colorScheme={option.id === 'none' ? 'muted' : 'lime'}
            shadow={2}>
            <Center>
              <Text fontSize="sm" fontWeight="bold" color="white">
                {option.name}
              </Text>
              <Text fontSize="sm" color="white">
                {t('price', { price: option.price.toFixed(2) })}
              </Text>
            </Center>
          </Button>
        ))}
      </Flex>
    </ScrollView>
  );
};

export default OptionsPicker;
