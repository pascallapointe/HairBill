import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Divider,
  Heading,
  HStack,
  KeyboardAvoidingView,
  ScrollView,
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

    if (taxSettings.includeTax) {
      // todo
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
      <SafeAreaView>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'position' : 'height'}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Heading color="white" size="4xl" mb={4} fontFamily="SignPainter">
              &nbsp;{t<string>('invoice.title')}&nbsp;
            </Heading>
            <Card width={{ md: '700px', lg: '1000px' }} py={4}>
              <Box py={5} px={10}>
                <View zIndex={10}>
                  <Heading color="violet.700">
                    {t<string>('invoice.clientInfo')}
                  </Heading>
                  <Divider mb={2} bg="violet.700" />
                  <ClientInput
                    ref={clientField}
                    label="Nom du client"
                    bindValue={setClient}
                    clear="while-editing"
                    schema={z
                      .string({
                        required_error: t<string>('validation.required'),
                      })
                      .min(3, {
                        message: t<string>('validation.min', { count: 3 }),
                      })}
                  />
                </View>
                <Heading mt={5} color="violet.700">
                  {t<string>('invoice.productsAndServices')}
                </Heading>
                <Divider mb={2} bg="violet.700" />
                <ProductsSelect
                  ref={productsField}
                  label={t<string>('invoice.selectedP&S')}
                  bindValue={setProducts}
                />
                <Heading mt={5} color="violet.700">
                  {t<string>('invoice.total')}
                </Heading>
                <Divider mb={2} bg="violet.700" />
                {taxSettings.enabled ? (
                  <HStack justifyContent="space-between">
                    <Text fontSize="md" fontWeight="bold" color="muted.500">
                      {taxSettings.taxAName}
                    </Text>
                    <Text fontSize="md" fontWeight="bold" color="muted.600">
                      {t('price', { price: amount.taxA.toFixed(2) })}
                    </Text>
                  </HStack>
                ) : (
                  ''
                )}
                {taxSettings.enabled && taxSettings.useBTax ? (
                  <HStack justifyContent="space-between">
                    <Text fontSize="md" fontWeight="bold" color="muted.500">
                      {taxSettings.taxBName}
                    </Text>
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
            </Card>
          </ScrollView>
          <Modal
            ref={errorModal}
            hideAction={true}
            title={t('exception.operationFailed')}
            modalType="error">
            <Text fontSize="md" textAlign="center">
              {errorMessage}
            </Text>
          </Modal>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Box>
  );
};

export default InvoiceView;
