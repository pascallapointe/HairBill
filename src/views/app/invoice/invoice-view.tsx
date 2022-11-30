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

type AmountType = {
  subtotal: number;
  total: number;
  taxA: number;
  taxB: number;
};

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

const InvoiceView = () => {
  const { t } = useTranslation();
  const [init, setInit] = useState(true);
  const [taxSettings, setTaxSettings] =
    useState<TaxSettingsType>(defaultTaxSettings);
  const clientField = useRef<ClientInputRef>(null);
  const [client, setClient] = useState<ClientType>(defaultClient);
  const productsField = useRef<ProductSelectRef>(null);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [tip, setTip] = useState(0);
  const [paymentFormat, setPaymentFormat] = useState<'cash' | 'check' | null>(
    null,
  );
  const [amount, setAmount] = useState<AmountType>(defaultAmount);

  // Modals
  const errorModal = useRef<ModalRef>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (init) {
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
      p={5}
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
          width={{ md: '700px', lg: '1000px' }}
          height={{ md: '1050px', lg: '700px' }}
          py={4}>
          <Box py={5} px={10}>
            <Stack
              height={{ md: '940px', lg: '590px' }}
              direction={{ md: 'column', lg: 'row' }}
              space={{ md: 2, lg: 4 }}>
              <Box flex={{ md: 1.6, lg: 1 }}>
                <KeyboardAvoidingView
                  contentContainerStyle={{ backgroundColor: 'white' }}
                  zIndex={10}
                  keyboardVerticalOffset={380}
                  behavior={Platform.OS === 'ios' ? 'position' : 'height'}>
                  <Heading color="violet.700">
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
                <Heading mt={4} color="violet.700">
                  {t<string>('invoice.productsAndServices')}
                  <Box display={taxSettings.includeTax ? 'flex' : 'none'}>
                    <Text bottom={1} ml={4} fontSize="md" color="muted.500">
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
                <Heading color="violet.700">
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
                    size="lg"
                    minW="120px"
                    colorScheme={paymentFormat === 'cash' ? 'lime' : 'muted'}
                    shadow={4}
                    onPress={() =>
                      setPaymentFormat(paymentFormat === 'cash' ? null : 'cash')
                    }>
                    Cash
                  </Button>
                  <Button
                    leftIcon={
                      paymentFormat === 'check' ? (
                        <Icon as={FontAwesomeIcon} name="check" />
                      ) : undefined
                    }
                    size="lg"
                    minW="120px"
                    colorScheme={paymentFormat === 'check' ? 'lime' : 'muted'}
                    shadow={4}
                    onPress={() =>
                      setPaymentFormat(
                        paymentFormat === 'check' ? null : 'check',
                      )
                    }>
                    Check
                  </Button>
                </HStack>
                <Heading mt={4} color="violet.700">
                  {t<string>('invoice.tip')}
                </Heading>
                <Divider mb={2} bg="violet.700" />
                <View zIndex={10}>
                  <TipInput bindValue={setTip} value="0" />
                </View>
                <Heading mt={4} color="violet.700">
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
          </Box>
          <Center>
            <ActionButton
              colorScheme="violet"
              text={t<string>('save')}
              action={() => null}
            />
          </Center>
        </Card>
        <Modal
          ref={errorModal}
          hideAction={true}
          title={t('exception.operationFailed')}
          modalType="error">
          <Text fontSize="md" textAlign="center">
            {errorMessage}
          </Text>
        </Modal>
      </SafeAreaView>
    </Box>
  );
};

export default InvoiceView;
