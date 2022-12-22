import React, { useEffect, useRef, useState } from 'react';
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
import { InvoiceType, updateTip } from '@app/main/invoice/invoice.repository';
import { TaxSettingsType } from '@app/main/options/sales-tax/sales-tax.repository';
import { GeneralSettingsType } from '@app/main/options/general/general.repository';
import { createTimestamp } from '@lib/utils';
import {
  buildSectionMap,
  ProductSectionMapType,
  ProductType,
} from '@app/main/services/product/product.repository';
import OctIcon from 'react-native-vector-icons/Octicons';
import ViewShot from 'react-native-view-shot';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import Modal, { ModalRef } from '@components/modal';
import RNPrint from 'react-native-print';
import TipInput, { TipInputRef } from '@app/main/invoice/tip/tip-input';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { defaultTipValues } from '@app/main/invoice/tip/list';
import { BTPrinter } from '@app/main/invoice/bt-printer';
import ActionButton from '@components/action-button';
import { BLEPrinter } from 'react-native-thermal-receipt-printer-image-qr';

const Items: React.FC<{
  item: ProductType;
}> = ({ item }) => {
  const { t } = useTranslation();
  return (
    <HStack justifyContent="space-between">
      <HStack maxW="210px">
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
      <HStack>
        <Text top="3px" fontSize="xs" fontWeight="bold" color="muted.500">
          {item.quantity} X
        </Text>
        <Text
          ml={1}
          minW="70px"
          fontSize="md"
          fontWeight="bold"
          textAlign="right"
          color="muted.600">
          {t('price', { price: item.price.toFixed(2) })}
        </Text>
      </HStack>
    </HStack>
  );
};

const ProductList: React.FC<{ products: ProductSectionMapType }> = ({
  products,
}) => {
  return (
    <View>
      {Object.keys(products).map(key => (
        <View key={key}>
          <Text
            fontSize="sm"
            fontWeight="bold"
            color={key === 'none' ? 'muted.400' : 'pink.500'}>
            {products[key].name}
          </Text>

          {products[key].products.map((item, itemIndex) => (
            <Items key={item.id + itemIndex} item={item} />
          ))}
        </View>
      ))}
    </View>
  );
};

const ReceiptView: React.FC<{
  showReceipt: boolean;
  receipt: InvoiceType;
  taxSettings: TaxSettingsType;
  generalSettings: GeneralSettingsType;
  closeAction: () => void;
  showAddTip: boolean;
}> = ({
  showReceipt,
  receipt,
  taxSettings,
  generalSettings,
  closeAction,
  showAddTip,
}) => {
  const { t } = useTranslation();
  const [tip, setTip] = useState<number>(receipt.tip);
  const receiptRef = useRef<ViewShot>(null);
  const amount = receipt.total;
  const tipField = useRef<TipInputRef>(null);
  const [btEnabled, setBTEnabled] = useState(false);

  // Products section map
  const products = buildSectionMap(
    receipt.products,
    t<string>('services.noCategory'),
  );
  if (products.none && !products.none.products.length) {
    delete products.none;
  }

  useEffect(() => {
    setTip(receipt.tip);
    return () => {
      BLEPrinter.closeConn().catch(console.error);
    };
  }, [receipt]);

  // Modals
  const tipModal = useRef<ModalRef>(null);
  const successModal = useRef<ModalRef>(null);
  const errorModal = useRef<ModalRef>(null);
  const [successTitle, setSuccessTitle] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  async function print(): Promise<void> {
    if (receiptRef.current?.capture) {
      const uri = await receiptRef.current.capture();
      RNPrint.print({
        html: `<html lang="en"><div style="text-align: center;"><img width="350px" src="file://${uri}" alt="HairBill Receipt" /></div></html>`,
      }).catch(() => errorModal.current && errorModal.current.open());
    }
  }

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

  function addTip(): void {
    const fields = [tipField.current && tipField.current.validate()];
    if (fields.every(field => field)) {
      const val = tipField.current && tipField.current.getValue();
      if (val && receipt.id) {
        const newTip = parseFloat(val.replace(',', '.'));
        updateTip(receipt.id, newTip);
        setTip(newTip);
        tipModal.current && tipModal.current.close();

        // Save last 12 custom tip value
        AsyncStorage.getItem('lastTips')
          .then(value => {
            const formattedTip = newTip.toFixed(2).toString();
            if (!defaultTipValues.includes(formattedTip)) {
              const lastAmounts = value ? JSON.parse(value) : [];
              const amountsSet = [...new Set([formattedTip, ...lastAmounts])];
              AsyncStorage.setItem(
                'lastTips',
                JSON.stringify(amountsSet.slice(0, 12)),
              ).catch(console.error);
            }
          })
          .catch(console.error);
      } else {
        errorModal.current && errorModal.current.open();
      }
    }
  }

  async function btPrint(): Promise<boolean> {
    const btPrinter = new BTPrinter();
    await btPrinter.init();

    if (!btEnabled) {
      if (!btPrinter.getPrinters().length) {
        setErrorMessage(t<string>('invoice.noBTPrinterFound'));
        errorModal.current && errorModal.current.open();
        return false;
      }

      if (btPrinter.getPrinters().length > 1) {
        // todo: add modal to select printer
      } else {
        await btPrinter.setCurrentPrinter(btPrinter.getPrinters()[0]);
        setBTEnabled(true);
      }
    }

    try {
      await btPrinter.printReceipt(receipt, products, tip, t);
    } catch (e) {
      console.error(e);
      errorModal.current && errorModal.current.open();
    }

    return false;
  }

  return (
    <Box
      display={showReceipt ? 'flex' : 'none'}
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
            <VStack px={5} py={4} ref={receiptRef}>
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

              <ProductList products={products} />

              <Heading size="md" mt={2} color="violet.700">
                {t<string>('invoice.total')}
              </Heading>
              <Divider mb={2} bg="black" />
              {taxSettings.enabled ? (
                <>
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

              <HStack mt={3}>
                <Text fontSize="md" fontWeight="bold">
                  {t<string>('invoice.paymentMethod')} :
                </Text>
                <Text ml={1} fontSize="md" fontWeight="bold" color="muted.600">
                  {t<string>('invoice.' + receipt.payment)}
                </Text>
              </HStack>

              <HStack display={tip > 0 ? 'flex' : 'none'}>
                <Text fontSize="md" fontWeight="bold">
                  {t<string>('invoice.tip')} :
                </Text>
                <Text ml={1} fontSize="md" fontWeight="bold" color="muted.600">
                  {t('price', { price: tip.toFixed(2) })}
                </Text>
              </HStack>

              <HStack
                mt={3}
                display={
                  receipt.updatedAt || receipt.deletedAt ? 'flex' : 'none'
                }>
                {receipt.deletedAt ? (
                  <>
                    <Text fontSize="md" fontWeight="bold" color="muted.500">
                      {t<string>('invoice.deletedOn')} :
                    </Text>
                    <Text ml={1} fontSize="md" color="muted.500">
                      {createTimestamp(new Date(receipt.deletedAt))}
                    </Text>
                  </>
                ) : (
                  ''
                )}
                {receipt.updatedAt && receipt.deletedAt === null ? (
                  <>
                    <Text fontSize="md" fontWeight="bold" color="muted.500">
                      {t<string>('invoice.updatedOn')} :
                    </Text>
                    <Text ml={1} fontSize="md" color="muted.500">
                      {createTimestamp(new Date(receipt.updatedAt))}
                    </Text>
                  </>
                ) : (
                  ''
                )}
              </HStack>
              <HStack
                display={
                  (receipt.updatedAt &&
                    receipt.updateNote.length &&
                    !receipt.deletedAt) ||
                  (receipt.deletedAt && receipt.deleteNote.length)
                    ? 'flex'
                    : 'none'
                }>
                <Text fontSize="md" fontWeight="bold" color="muted.500">
                  Note :
                </Text>
                <Text ml={1} fontSize="md" color="muted.500">
                  {receipt.deletedAt ? receipt.deleteNote : receipt.updateNote}
                </Text>
              </HStack>

              <Center>
                <Text mt={5} fontSize="xl" fontWeight="bold" color="pink.500">
                  {t<string>('invoice.thankYou')} !
                </Text>
              </Center>
            </VStack>
          </ScrollView>
          <Box
            display={receipt.deletedAt ? 'flex' : 'none'}
            position="absolute"
            h="150px"
            w="410px"
            top="240px"
            zIndex={1000}
            style={{ transform: [{ rotateZ: '45deg' }] }}>
            <Text color="red.600" fontSize="100px" fontWeight="black">
              {t<string>('invoice.deletedLabel')}
            </Text>
          </Box>
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
              onPress={print}
              maxW="200px"
              m={2}
              shadow={4}
              leftIcon={
                <FontAwesome5Icon color="white" size={20} name="wifi" />
              }
              colorScheme="cyan">
              AirPrint
            </Button>
            <ActionButton
              maxW="200px"
              m={2}
              text="BT Print"
              action={btPrint}
              shadow={4}
              leftIcon={
                <FontAwesome5Icon color="white" size={20} name="bluetooth" />
              }
              colorScheme="blue">
              BT Print
            </ActionButton>
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
              display={showAddTip ? 'flex' : 'none'}
              onPress={() => tipModal.current && tipModal.current.open()}
              maxW="200px"
              mx={2}
              mt={10}
              shadow={4}
              leftIcon={
                <FontAwesome5Icon color="white" size={18} name="coins" />
              }
              colorScheme="lime">
              {t<string>('invoice.addTip')}
            </Button>
            <Button
              onPress={closeAction}
              maxW="200px"
              mx={2}
              mt={10}
              leftIcon={<Icon as={FontAwesomeIcon} size={18} name="close" />}
              variant="outline"
              colorScheme="muted">
              {t<string>('close')}
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
        modalType="error"
        callback={() => setErrorMessage('')}>
        <Text fontSize="md" textAlign="center">
          {errorMessage.length ? errorMessage : t('exception.operationFailed')}
        </Text>
      </Modal>
      <Modal
        ref={tipModal}
        size="xl"
        title={t('invoice.addTip')}
        modalType="success"
        action={async () => addTip()}
        actionAutoClose={false}>
        <Box h="230px">
          <TipInput
            ref={tipField}
            label={t<string>('invoice.tip')}
            value="0"
            popoverPosition="bottom"
          />
        </Box>
      </Modal>
      <Button
        onPress={closeAction}
        position="absolute"
        right="10px"
        top="10px"
        variant="ghost"
        rounded={10}
        colorScheme="fuchsia">
        <Icon
          size="30px"
          left="2px"
          as={FontAwesomeIcon}
          name="close"
          color="white"
        />
      </Button>
    </Box>
  );
};

export default ReceiptView;
