import React from 'react';
import {
  buildSectionMap,
  ProductType,
} from '@views/app/services/product/product.repository';
import { useTranslation } from 'react-i18next';
import { Box, Button, HStack, Icon, Text, View, VStack } from 'native-base';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import OctIcon from 'react-native-vector-icons/Octicons';

const SelectedItem: React.FC<{
  item: ProductType;
  remove: (productId: string) => void;
}> = ({ item, remove }) => {
  const { t } = useTranslation();
  return (
    <HStack justifyContent="space-between">
      <HStack>
        <Icon
          top="5px"
          color="violet.700"
          size="md"
          ml={5}
          as={OctIcon}
          name="dot"
        />
        <Text fontSize="xl" fontWeight="bold" color="light.700">
          {item.name}
        </Text>
      </HStack>

      <HStack>
        <Text ml={4} fontSize="lg" fontWeight="bold" color="muted.500">
          {t('price', { price: item.price.toFixed(2) })}
        </Text>
        <Button
          ml={4}
          bottom={1}
          variant="ghost"
          colorScheme="danger"
          onPress={() => remove(item.id)}>
          <Icon as={FontAwesome5Icon} name="trash" />
        </Button>
      </HStack>
    </HStack>
  );
};

const SelectedList: React.FC<{
  selected: ProductType[];
  remove: (productId: string) => void;
}> = ({ selected, remove }) => {
  const { t } = useTranslation();
  const sectionMap = buildSectionMap(
    selected,
    t<string>('services.noCategory'),
  );

  if (sectionMap.none && !sectionMap.none.products.length) {
    delete sectionMap.none;
  }

  if (!selected.length) {
    return (
      <Box height="100px" justifyContent="center" alignItems="center">
        <Text fontSize="lg" color="muted.500">
          {t<string>('invoice.noProduct')}
        </Text>
      </Box>
    );
  }

  return (
    <VStack>
      {Object.keys(sectionMap).map((key, index) => (
        <View key={key}>
          <Text
            fontSize="lg"
            fontWeight="bold"
            mt={index > 0 ? 4 : 0}
            color={key === 'none' ? 'muted.400' : 'pink.500'}>
            {sectionMap[key].name}
          </Text>

          {sectionMap[key].products.map((item, itemIndex) => (
            <SelectedItem
              key={item.id + itemIndex}
              item={item}
              remove={remove}
            />
          ))}
        </View>
      ))}
    </VStack>
  );
};

export default SelectedList;
