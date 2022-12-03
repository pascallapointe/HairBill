import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Center,
  Divider,
  Heading,
  HStack,
  Icon,
  KeyboardAvoidingView,
  Stack,
  Text,
  View,
} from 'native-base';
import { useTranslation } from 'react-i18next';
import { Platform, SafeAreaView } from 'react-native';
import Card from '@components/card';
import ClientInput, {
  ClientInputRef,
} from '@views/app/invoice/client/client-input';
import { ClientType } from '@views/app/invoice/client/client.repository';
import { z } from 'zod';
import ProductsSelect, {
  ProductSelectRef,
} from '@views/app/invoice/products/products-select';
import { ProductType } from '@views/app/services/product/product.repository';
import {
  defaultTaxSettings,
  getTaxSettings,
  TaxSettingsType,
} from '@views/app/options/sales-tax/sales-tax.repository';
import Modal, { ModalRef } from '@components/modal';
import { roundTo } from '@lib/utils';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import TipInput from '@views/app/invoice/tip/tip-input';
import ActionButton from '@components/action-button';
import {
  addInvoice,
  AmountType,
  getNextInvoiceNumber,
  InvoiceType,
} from '@views/app/invoice/invoice.repository';
import { InputRef } from '@components/form/text-input';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import ReceiptView from '@views/app/invoice/receipt-view';
import {
  GeneralSettingsType,
  getGeneralSettings,
} from '@views/app/options/general/general.repository';

const defaultClient = {
  id: '',
  name: '',
  phone: '',
};

const defaultAmount = {
  subtotal: 0,
  total: 0,
  taxA: 0,
  taxB: 0,
};

const defaultReceipt = {
  id: '',
  invoiceNumber: '',
  date: new Date().valueOf(),
  client: defaultClient,
  products: [],
  tip: 0,
  payment: null,
  total: defaultAmount,
};

const defaultGeneralSettings = {
  shopName: '',
  phone: '',
  employeeName: '',
  address: '',
};

interface Props {
  navigation: NavigationProp<ParamListBase>;
}

const InvoiceView: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const [init, setInit] = useState(true);
  const [taxSettings, setTaxSettings] =
    useState<TaxSettingsType>(defaultTaxSettings);
  const [generalSettings, setGeneralSettings] = useState<GeneralSettingsType>(
    defaultGeneralSettings,
  );
  const clientField = useRef<ClientInputRef>(null);
  const [client, setClient] = useState<ClientType>(defaultClient);
  const productsField = useRef<ProductSelectRef>(null);
  const [products, setProducts] = useState<ProductType[]>([]);
  const tipField = useRef<InputRef>(null);
  const [tip, setTip] = useState(0);
  const [wait, setWait] = useState(false);
  const [paymentFormat, setPaymentFormat] = useState<'cash' | 'check' | null>(
    null,
  );
  const [amount, setAmount] = useState<AmountType>(defaultAmount);
  const [invoiceNum, setInvoiceNum] = useState<string>('');
  const [receipt, setReceipt] = useState<InvoiceType>(defaultReceipt);

  // Modals
  const successModal = useRef<ModalRef>(null);
  const errorModal = useRef<ModalRef>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (init) {
      getGeneralSettings().then(val => val && setGeneralSettings(val));
      getNextInvoiceNumber().then(setInvoiceNum);
      getTaxSettings()
        .then(val => {
          if (val) {
            setTaxSettings(val);
          }
          setInit(false);
        })
        .catch(e => {
          setErrorMessage(t<string>(e.message ?? 'exception.database'));
          errorModal.current && errorModal.current.open();
        });
    }
  }, []);

  function save() {
    const fields = [
      clientField.current && clientField.current.validate(),
      productsField.current && productsField.current.validate(),
      tipField.current && tipField.current.validate(),
    ];
    if (fields.every(field => field)) {
      setWait(true);
      const r = addInvoice({
        invoiceNumber: invoiceNum,
        date: new Date().valueOf(),
        client: client,
        products: products,
        tip: tip,
        payment: paymentFormat,
        total: amount,
      });
      setReceipt(r);
      successModal.current && successModal.current.open();
    }
  }

  useEffect(() => {
    const a = { ...defaultAmount };
    for (const product of products) {
      a.total += product.price;
    }
    if (!taxSettings.enabled) {
      return setAmount(a);
    }

    // Tax calculation

    if (taxSettings.includeTax) {
      a.subtotal =
        a.total /
        (1 +
          taxSettings.taxA +
          (taxSettings.useBTax
            ? taxSettings.compounded
              ? taxSettings.taxB * (1 + taxSettings.taxA)
              : taxSettings.taxB
            : 0));

      a.taxA = taxSettings.taxA * a.subtotal;
      a.taxB =
        taxSettings.taxB *
        (taxSettings.compounded
          ? (1 + taxSettings.taxA) * a.subtotal
          : a.subtotal);

      a.subtotal = roundTo(a.subtotal, 2);
      a.taxA = roundTo(a.taxA, 2);
      a.taxB = roundTo(a.taxB, 2);

      return setAmount(a);
    } else {
      a.subtotal = a.total;
      a.taxA = a.subtotal * taxSettings.taxA;
      a.total += a.taxA;
      if (taxSettings.useBTax) {
        if (taxSettings.compounded) {
          a.taxB = a.total * taxSettings.taxB;
        } else {
          a.taxB = a.subtotal * taxSettings.taxB;
        }
        a.total += a.taxB;
      }

      a.taxA = roundTo(a.taxA, 2);
      a.taxB = roundTo(a.taxB, 2);
      a.total = roundTo(a.total, 2);

      return setAmount(a);
    }
  }, [products]);

  return (
    <Box
      flex={1}
      bg={{
        linearGradient: {
          colors: ['fuchsia.400', 'violet.900'],
          start: [0, 0],
          end: [1, 0],
        },
      }}>
      <SafeAreaView
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Card
          width={{ md: '680px', lg: '1000px' }}
          height={{ md: '920px', lg: '680px' }}>
          <Box py={{ md: 2, lg: 2 }} px={{ md: 5, lg: 2 }}>
            <Stack
              height={{ md: '850px', lg: '610px' }}
              direction={{ md: 'column', lg: 'row' }}
              space={{ md: 0, lg: 6 }}
              divider={
                <Divider
                  display={{ md: 'none', lg: 'flex' }}
                  orientation="vertical"
                  bgColor="muted.400"
                />
              }>
              <Box flex={{ md: 1.5, lg: 1 }}>
                <KeyboardAvoidingView
                  contentContainerStyle={{ backgroundColor: 'white' }}
                  zIndex={10}
                  keyboardVerticalOffset={300}
                  behavior={Platform.OS === 'ios' ? 'position' : 'height'}>
                  <Heading size="md" color="violet.700">
                    {t<string>('invoice.clientInfo')}
                  </Heading>
                  <Divider mb={2} bg="violet.700" />
                  <ClientInput
                    ref={clientField}
                    label="Nom du client"
                    bindValue={setClient}
                    placeholder={t<string>('invoice.type3Chars')}
                    clear="while-editing"
                    schema={z
                      .string({
                        required_error: t<string>('validation.required'),
                      })
                      .min(3, {
                        message: t<string>('validation.min', { count: 3 }),
                      })}
                  />
                </KeyboardAvoidingView>
                <Heading size="md" mt={2} color="violet.700">
                  {t<string>('invoice.productsAndServices')}
                  <Box display={taxSettings.includeTax ? 'flex' : 'none'}>
                    <Text top="2px" ml={4} fontSize="sm" color="muted.500">
                      ({t<string>('invoice.taxIncluded')})
                    </Text>
                  </Box>
                </Heading>
                <Divider mb={2} bg="violet.700" />
                <ProductsSelect
                  ref={productsField}
                  label={t<string>('invoice.selectedP&S')}
                  bindValue={setProducts}
                />
              </Box>
              <Box flex={1}>
                <Heading size="md" color="violet.700">
                  {t<string>('invoice.tip')}
                </Heading>
                <Divider mb={2} bg="violet.700" />
                <View zIndex={10}>
                  <TipInput ref={tipField} bindValue={setTip} value="0" />
                </View>
                <Heading size="md" mt={2} color="violet.700">
                  {t<string>('invoice.payment')}
                </Heading>
                <Divider mb={2} bg="violet.700" />
                <HStack py={2} space={2} justifyContent="center">
                  <Button
                    leftIcon={
                      paymentFormat === 'cash' ? (
                        <Icon as={FontAwesomeIcon} name="check" />
                      ) : undefined
                    }
                    size="md"
                    minW="120px"
                    colorScheme={paymentFormat === 'cash' ? 'lime' : 'muted'}
                    shadow={4}
                    onPress={() =>
                      setPaymentFormat(paymentFormat === 'cash' ? null : 'cash')
                    }>
                    {t<string>('invoice.cash')}
                  </Button>
                  <Button
                    leftIcon={
                      paymentFormat === 'check' ? (
                        <Icon as={FontAwesomeIcon} name="check" />
                      ) : undefined
                    }
                    size="md"
                    minW="120px"
                    colorScheme={paymentFormat === 'check' ? 'lime' : 'muted'}
                    shadow={4}
                    onPress={() =>
                      setPaymentFormat(
                        paymentFormat === 'check' ? null : 'check',
                      )
                    }>
                    {t<string>('invoice.check')}
                  </Button>
                </HStack>
                <Heading size="md" mt={2} color="violet.700">
                  {t<string>('invoice.total')}
                </Heading>
                <Divider mb={2} bg="violet.700" />
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
                <HStack justifyContent="space-between">
                  <Text fontSize="lg" fontWeight="bold" color="muted.700">
                    {t<string>('invoice.total')}
                  </Text>
                  <Text fontSize="lg" fontWeight="bold" color="violet.700">
                    {t('price', { price: amount.total.toFixed(2) })}
                  </Text>
                </HStack>
              </Box>
            </Stack>
            <Center>
              <ActionButton
                mt={2}
                wait={wait}
                colorScheme="violet"
                text={t<string>('save')}
                action={save}
              />
            </Center>
          </Box>
        </Card>
      </SafeAreaView>
      <Modal
        ref={successModal}
        outClick={false}
        callback={async () => navigation.navigate('menu')}
        hideAction={true}
        closeBtnText={t<string>('goToMenu')}
        title={t('invoice.saved')}
        modalType="success">
        <ReceiptView
          receipt={receipt}
          generalSettings={generalSettings}
          taxSettings={taxSettings}
        />
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
    </Box>
  );
};

export default InvoiceView;
