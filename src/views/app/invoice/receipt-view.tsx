import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Center,
  Divider,
  Heading,
  HStack,
  Icon,
  ScrollView,
  Text,
  View,
  VStack,
} from 'native-base';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import { InvoiceType } from '@views/app/invoice/invoice.repository';
import { TaxSettingsType } from '@views/app/options/sales-tax/sales-tax.repository';
import { GeneralSettingsType } from '@views/app/options/general/general.repository';
import { createTimestamp } from '@lib/utils';
import {
  buildSectionMap,
  ProductType,
} from '@views/app/services/product/product.repository';
import OctIcon from 'react-native-vector-icons/Octicons';

const Items: React.FC<{
  item: ProductType;
}> = ({ item }) => {
  const { t } = useTranslation();
  return (
    <HStack justifyContent="space-between">
      <HStack>
        <Icon
          top="3px"
          color="violet.700"
          size="md"
          ml={5}
          as={OctIcon}
          name="dot"
        />
        <Text fontSize="md" fontWeight="bold" color="light.700">
          {item.name}
        </Text>
      </HStack>
      <Text ml={4} fontSize="md" fontWeight="bold" color="muted.600">
        {t('price', { price: item.price.toFixed(2) })}
      </Text>
    </HStack>
  );
};

const ProductList: React.FC<{ products: ProductType[] }> = ({ products }) => {
  const { t } = useTranslation();
  const sectionMap = buildSectionMap(
    products,
    t<string>('services.noCategory'),
  );
  if (sectionMap.none && !sectionMap.none.products.length) {
    delete sectionMap.none;
  }
  return (
    <View>
      {Object.keys(sectionMap).map(key => (
        <View key={key}>
          <Text
            fontSize="sm"
            fontWeight="bold"
            color={key === 'none' ? 'muted.400' : 'pink.500'}>
            {sectionMap[key].name}
          </Text>

          {sectionMap[key].products.map((item, itemIndex) => (
            <Items key={item.id + itemIndex} item={item} />
          ))}
        </View>
      ))}
    </View>
  );
};

const ReceiptView: React.FC<{
  receipt: InvoiceType;
  taxSettings: TaxSettingsType;
  generalSettings: GeneralSettingsType;
}> = ({ receipt, taxSettings, generalSettings }) => {
  const { t } = useTranslation();
  const amount = receipt.total;

  return (
    <Box>
      <HStack space={2}>
        <Button
          leftIcon={<FontAwesome5Icon color="white" size={18} name="image" />}
          flex={1}
          size="sm"
          colorScheme="fuchsia">
          Screenshot
        </Button>
        <Button
          leftIcon={<FontAwesome5Icon color="white" size={16} name="wifi" />}
          flex={1}
          size="sm"
          colorScheme="purple">
          AirPrint
        </Button>
        <Button
          leftIcon={
            <FontAwesome5Icon color="white" size={16} name="bluetooth" />
          }
          flex={1}
          size="sm"
          colorScheme="violet">
          BT Print
        </Button>
      </HStack>
      <ScrollView maxHeight={{ md: '600px', lg: '400px' }}>
        <VStack shadow={4} m={2}>
          <Center>
            <Text fontSize="4xl" fontWeight="bold">
              {t<string>('invoice.invoice')}
            </Text>
            <Text
              fontSize="lg"
              fontWeight="bold"
              display={generalSettings.shopName.length ? 'flex' : 'none'}>
              {generalSettings.shopName}
            </Text>
            <Text
              fontSize="md"
              fontWeight="bold"
              display={generalSettings.phone.length ? 'flex' : 'none'}>
              {generalSettings.phone}
            </Text>
            <Text
              my={2}
              fontSize="sm"
              display={generalSettings.address.length ? 'flex' : 'none'}>
              {generalSettings.address}
            </Text>
            <Text
              fontSize="md"
              display={generalSettings.employeeName.length ? 'flex' : 'none'}>
              {generalSettings.employeeName}
            </Text>
          </Center>
          <HStack mt={4} justifyContent="space-between">
            <HStack>
              <Text fontSize="md" fontWeight="bold">
                # {t<string>('invoice.invoice')} :
              </Text>
              <Text ml={1} fontSize="md" fontWeight="bold" color="violet.700">
                {receipt.invoiceNumber}
              </Text>
            </HStack>

            <Text fontSize="md" fontWeight="bold" color="muted.600">
              {createTimestamp(new Date(receipt.date))}
            </Text>
          </HStack>
          <HStack mt={2}>
            <Text fontSize="md" fontWeight="bold">
              {t<string>('invoice.client')} :
            </Text>
            <Text ml={1} fontSize="md" fontWeight="bold" color="muted.600">
              {receipt.client.name}
            </Text>
          </HStack>

          <Heading size="md" mt={5} color="violet.700">
            {t<string>('invoice.productsAndServices')}
            <Box display={taxSettings.includeTax ? 'flex' : 'none'}>
              <Text ml={4} fontSize="sm" color="muted.500">
                ({t<string>('invoice.taxIncluded')})
              </Text>
            </Box>
          </Heading>
          <Divider mb={2} bg="black" />

          <ProductList products={receipt.products} />

          <Heading size="md" mt={5} color="violet.700">
            {t<string>('invoice.total')}
          </Heading>
          <Divider mb={2} bg="black" />
          {taxSettings.enabled ? (
            <>
              <HStack
                mb={1}
                display={receipt.tip > 0 ? 'flex' : 'none'}
                justifyContent="space-between">
                <Text fontSize="md" fontWeight="bold" color="muted.500">
                  {t<string>('invoice.tip')}
                </Text>
                <Text fontSize="md" fontWeight="bold" color="muted.600">
                  {t('price', { price: receipt.tip.toFixed(2) })}
                </Text>
              </HStack>
              <HStack justifyContent="space-between">
                <Text fontSize="md" fontWeight="bold" color="muted.500">
                  {t<string>('invoice.subtotal')}
                </Text>
                <Text fontSize="md" fontWeight="bold" color="muted.600">
                  {t('price', { price: amount.subtotal.toFixed(2) })}
                </Text>
              </HStack>
              <HStack justifyContent="space-between">
                <HStack space={2}>
                  <Text fontSize="md" fontWeight="bold" color="muted.500">
                    {taxSettings.taxAName}
                  </Text>
                  <Text
                    top={1}
                    fontSize="2xs"
                    fontWeight="bold"
                    color="muted.500">
                    {taxSettings.taxANumber.length
                      ? `(${taxSettings.taxANumber})`
                      : ''}
                  </Text>
                </HStack>

                <Text fontSize="md" fontWeight="bold" color="muted.600">
                  {t('price', { price: amount.taxA.toFixed(2) })}
                </Text>
              </HStack>
            </>
          ) : (
            ''
          )}
          {taxSettings.enabled && taxSettings.useBTax ? (
            <HStack justifyContent="space-between">
              <HStack space={2}>
                <Text fontSize="md" fontWeight="bold" color="muted.500">
                  {taxSettings.taxBName}
                </Text>
                <Text
                  top={1}
                  fontSize="2xs"
                  fontWeight="bold"
                  color="muted.500">
                  {taxSettings.taxBNumber.length
                    ? `(${taxSettings.taxBNumber})`
                    : ''}
                </Text>
              </HStack>

              <Text fontSize="md" fontWeight="bold" color="muted.600">
                {t('price', { price: amount.taxB.toFixed(2) })}
              </Text>
            </HStack>
          ) : (
            ''
          )}
          <HStack mt={1} justifyContent="space-between">
            <Text fontSize="lg" fontWeight="bold" color="muted.700">
              {t<string>('invoice.total')}
            </Text>
            <Text fontSize="lg" fontWeight="bold" color="violet.700">
              {t('price', { price: amount.total.toFixed(2) })}
            </Text>
          </HStack>

          <HStack mt={3} display={receipt.payment ? 'flex' : 'none'}>
            <Text fontSize="md" fontWeight="bold">
              {t<string>('invoice.paymentMethod')} :
            </Text>
            <Text ml={1} fontSize="md" fontWeight="bold" color="muted.600">
              {t<string>('invoice.' + receipt.payment)}
            </Text>
          </HStack>

          <Center>
            <Text mt={5} fontSize="xl" fontWeight="bold" color="pink.500">
              {t<string>('invoice.thankYou')} !
            </Text>
          </Center>
        </VStack>
      </ScrollView>
    </Box>
  );
};

export default ReceiptView;
