import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Center,
  Divider,
  Flex,
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
import ViewShot from 'react-native-view-shot';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import Modal, { ModalRef } from '@components/modal';

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
  navigation: NavigationProp<ParamListBase>;
}> = ({ receipt, taxSettings, generalSettings, navigation }) => {
  const { t } = useTranslation();
  const receiptRef = useRef<ViewShot>(null);
  const amount = receipt.total;

  // Modals
  const successModal = useRef<ModalRef>(null);
  const errorModal = useRef<ModalRef>(null);
  const [successTitle, setSuccessTitle] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  async function saveScreenshot(): Promise<void> {
    if (receiptRef.current?.capture) {
      const uri = await receiptRef.current.capture();
      CameraRoll.save(uri)
        .then(() => {
          setSuccessTitle(t<string>('invoice.screenshotSaved'));
          setSuccessMessage(t<string>('invoice.screenshotSavedLibrary'));
          successModal.current && successModal.current.open();
        })
        .catch(() => errorModal.current && errorModal.current.open());
    }
  }

  return (
    <Box
      position="absolute"
      height="100%"
      w="100%"
      flex={1}
      justifyContent="center"
      justifyItems="center"
      bg={{
        linearGradient: {
          colors: ['fuchsia.400', 'violet.900'],
          start: [0, 0],
          end: [1, 0],
        },
      }}>
      <HStack justifyContent="space-evenly">
        <ViewShot
          ref={receiptRef}
          options={{ fileName: 'Your-File-Name', format: 'jpg', quality: 0.9 }}>
          <ScrollView
            rounded={10}
            bgColor="white"
            width="400px"
            maxHeight={{ md: '940px', lg: '690px' }}
            pinchGestureEnabled={true}>
            <VStack px={5} py={4} shadow={4} ref={receiptRef}>
              <Center>
                <Text fontSize="4xl" fontWeight="bold">
                  {t<string>('invoice.invoice')}
                </Text>
                <Text
                  fontSize="lg"
                  fontWeight="bold"
                  color="fuchsia.600"
                  display={generalSettings.shopName.length ? 'flex' : 'none'}>
                  {generalSettings.shopName}
                </Text>
                <Text
                  fontSize="md"
                  fontWeight="bold"
                  color="fuchsia.400"
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
                  color="violet.700"
                  display={
                    generalSettings.employeeName.length ? 'flex' : 'none'
                  }>
                  {generalSettings.employeeName}
                </Text>
              </Center>
              <HStack mt={4} justifyContent="space-between">
                <HStack>
                  <Text fontSize="md" fontWeight="bold">
                    # {t<string>('invoice.invoice')} :
                  </Text>
                  <Text
                    ml={1}
                    fontSize="md"
                    fontWeight="bold"
                    color="muted.600">
                    {receipt.invoiceNumber}
                  </Text>
                </HStack>

                <Text fontSize="md" fontWeight="bold" color="muted.500">
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

              <Heading size="md" mt={4} color="violet.700">
                {t<string>('invoice.productsAndServices')}
                <Box display={taxSettings.includeTax ? 'flex' : 'none'}>
                  <Text ml={4} fontSize="sm" color="muted.500">
                    ({t<string>('invoice.taxIncluded')})
                  </Text>
                </Box>
              </Heading>
              <Divider mb={2} bg="black" />

              <ProductList products={receipt.products} />

              <Heading size="md" mt={2} color="violet.700">
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
        </ViewShot>
        <Box justifyContent="center">
          <Flex
            p={4}
            bgColor="white"
            shadow={4}
            rounded={10}
            direction="column"
            justifyContent="center">
            <Button
              maxW="200px"
              m={2}
              shadow={4}
              leftIcon={
                <FontAwesome5Icon color="white" size={20} name="wifi" />
              }
              colorScheme="cyan">
              AirPrint
            </Button>
            <Button
              maxW="200px"
              m={2}
              shadow={4}
              leftIcon={
                <FontAwesome5Icon color="white" size={20} name="bluetooth" />
              }
              colorScheme="blue">
              BT Print
            </Button>
            <Button
              maxW="200px"
              m={2}
              shadow={4}
              onPress={saveScreenshot}
              leftIcon={
                <FontAwesome5Icon color="white" size={20} name="image" />
              }
              colorScheme="fuchsia">
              Screenshot
            </Button>
            <Button
              onPress={() => navigation.navigate('menu')}
              maxW="200px"
              mx={2}
              mt={20}
              shadow={4}
              leftIcon={
                <FontAwesomeIcon color="white" size={18} name="chevron-left" />
              }
              colorScheme="muted">
              {t<string>('goToMenu')}
            </Button>
          </Flex>
        </Box>
      </HStack>
      <Modal
        ref={successModal}
        hideAction={true}
        title={successTitle}
        modalType="success">
        <Text fontSize="md" textAlign="center">
          {successMessage}
        </Text>
      </Modal>
      <Modal
        ref={errorModal}
        hideAction={true}
        title={t('exception.operationFailed')}
        modalType="error">
        <Text fontSize="md" textAlign="center">
          {t('exception.operationFailed')}
        </Text>
      </Modal>
    </Box>
  );
};

export default ReceiptView;
