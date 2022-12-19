import React from 'react';
import {
  buildSectionMap,
  ProductType,
} from '@views/app/services/product/product.repository';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  HStack,
  Icon,
  ScrollView,
  Text,
  View,
  VStack,
} from 'native-base';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import OctIcon from 'react-native-vector-icons/Octicons';

const SelectedItem: React.FC<{
  item: ProductType;
  select: (selected: ProductType) => void;
  remove: (productId: string, all?: boolean) => void;
}> = ({ item, select, remove }) => {
  const { t } = useTranslation();
  return (
    <HStack justifyContent="space-between">
      <HStack>
        <Icon
          top="2px"
          color="violet.700"
          size="md"
          ml={5}
          as={OctIcon}
          name="dot"
        />
        <Text
          maxW={{ md: '350px', lg: '180px' }}
          fontSize="md"
          fontWeight="bold"
          color="light.700">
          {item.name}
        </Text>
      </HStack>

      <HStack alignItems="flex-start">
        <Button
          p={1}
          size="xs"
          variant="ghost"
          colorScheme="pink"
          onPress={() => remove(item.id, false)}>
          <Icon
            as={FontAwesome5Icon}
            left={1}
            name="caret-left"
            color="pink.500"
          />
        </Button>
        <Text
          mx={1}
          minW="30px"
          fontSize="md"
          fontWeight="bold"
          color="muted.500"
          textAlign="center">
          {item.quantity}
        </Text>
        <Button
          p={1}
          size="xs"
          variant="ghost"
          colorScheme="pink"
          onPress={() => select(item)}>
          <Icon
            as={FontAwesome5Icon}
            left={1}
            name="caret-right"
            color="pink.500"
          />
        </Button>
        <Text
          minW="75px"
          fontSize="md"
          fontWeight="bold"
          color="muted.500"
          textAlign="right">
          {t('price', { price: item.price.toFixed(2) })}
        </Text>
        <Button
          ml={4}
          size="xs"
          bottom={1}
          variant="ghost"
          colorScheme="danger"
          onPress={() => remove(item.id, true)}>
          <Icon as={FontAwesome5Icon} name="trash" />
        </Button>
      </HStack>
    </HStack>
  );
};

const SelectedList: React.FC<{
  selected: ProductType[];
  select: (selected: ProductType) => void;
  remove: (productId: string, all?: boolean) => void;
}> = ({ selected, select, remove }) => {
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
      <Box height="60px" justifyContent="center" alignItems="center">
        <Text pt={2} fontSize="lg" color="muted.500">
          {t<string>('invoice.noProduct')}
        </Text>
      </Box>
    );
  }

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      maxHeight={{ md: '270px', lg: '360px' }}>
      <VStack>
        {Object.keys(sectionMap).map(key => (
          <View key={key}>
            <Text
              fontSize="sm"
              fontWeight="bold"
              color={key === 'none' ? 'muted.400' : 'pink.500'}>
              {sectionMap[key].name}
            </Text>

            {sectionMap[key].products.map((item, itemIndex) => (
              <SelectedItem
                key={item.id + itemIndex}
                item={item}
                select={select}
                remove={remove}
              />
            ))}
          </View>
        ))}
      </VStack>
    </ScrollView>
  );
};

export default SelectedList;
