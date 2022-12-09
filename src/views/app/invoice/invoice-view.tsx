import React, { useEffect, useRef, useState } from 'react';
import { Box, Center, Divider, Heading, Stack, Text, View } from 'native-base';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native';
import Card from '@components/card';
import ClientInput, {
  ClientInputRef,
  defaultClient,
} from '@views/app/invoice/client/client-input';
import { z } from 'zod';
import ProductsSelect, {
  ProductSelectRef,
} from '@views/app/invoice/products/products-select';
import {
  defaultGeneralSettings,
  defaultTaxSettings,
  getTaxSettings,
  TaxSettingsType,
} from '@views/app/options/sales-tax/sales-tax.repository';
import Modal, { ModalRef } from '@components/modal';
import { roundTo } from '@lib/utils';
import TipInput, { TipInputRef } from '@views/app/invoice/tip/tip-input';
import ActionButton from '@components/action-button';
import {
  addInvoice,
  defaultReceipt,
  getNextInvoiceNumber,
  InvoiceType,
} from '@views/app/invoice/invoice.repository';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import ReceiptView from '@views/app/invoice/receipt-view';
import {
  GeneralSettingsType,
  getGeneralSettings,
} from '@views/app/options/general/general.repository';
import PayMethod, { PayMethodRef } from '@views/app/invoice/payment/pay-method';
import Total, { defaultAmount, TotalRef } from '@views/app/invoice/total/total';
import { ProductType } from '@views/app/services/product/product.repository';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { defaultTipValues } from '@views/app/invoice/tip/list';

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
  const productsField = useRef<ProductSelectRef>(null);
  const tipField = useRef<TipInputRef>(null);
  const paymentField = useRef<PayMethodRef>(null);
  const totalRef = useRef<TotalRef>(null);
  const [invoiceNum, setInvoiceNum] = useState<string>('');
  const [receipt, setReceipt] = useState<InvoiceType>({ ...defaultReceipt });
  const [wait, setWait] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);

  // Modals
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
        client:
          (clientField.current && clientField.current.getValue()) ??
          defaultClient,
        products:
          (productsField.current && productsField.current.getValue()) ?? [],
        tip: roundTo(
          parseFloat(
            (tipField.current &&
              tipField.current.getValue().replace(',', '.')) ??
              '0',
          ),
          2,
        ),
        payment:
          (paymentField.current && paymentField.current.getValue()) ??
          'pending',
        total: (totalRef.current && totalRef.current.getValue()) ?? {
          ...defaultAmount,
        },
      });
      setReceipt(r);
      setShowReceipt(true);

      // Save last 12 custom tip value
      AsyncStorage.getItem('lastTips')
        .then(value => {
          const formattedTip = r.tip.toFixed(2).toString();
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
    }
  }

  function productsSelectHandler(products: ProductType[]) {
    totalRef.current && totalRef.current.calculate(products);
  }

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
                <View zIndex={10}>
                  <Heading size="md" color="violet.700">
                    {t<string>('invoice.clientInfo')}
                  </Heading>
                  <Divider mb={2} bg="violet.700" />
                  <ClientInput
                    ref={clientField}
                    label="Nom du client"
                    placeholder={t<string>('invoice.type3Chars')}
                    schema={z
                      .string({
                        required_error: t<string>('validation.required'),
                      })
                      .min(3, {
                        message: t<string>('validation.min', { count: 3 }),
                      })}
                  />
                </View>
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
                  selectBind={productsSelectHandler}
                />
              </Box>
              <Box flex={1}>
                <Heading size="md" color="violet.700">
                  {t<string>('invoice.tip')}
                </Heading>
                <Divider mb={2} bg="violet.700" />
                <View zIndex={10}>
                  <TipInput ref={tipField} value="0" />
                </View>
                <Heading size="md" mt={2} color="violet.700">
                  {t<string>('invoice.payment')}
                </Heading>
                <Divider mb={2} bg="violet.700" />
                <PayMethod ref={paymentField} />
                <Heading size="md" mt={2} color="violet.700">
                  {t<string>('invoice.total')}
                </Heading>
                <Divider mb={2} bg="violet.700" />
                <Total ref={totalRef} init={init} taxSettings={taxSettings} />
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
        ref={errorModal}
        hideAction={true}
        title={t('exception.operationFailed')}
        modalType="error">
        <Text fontSize="md" textAlign="center">
          {errorMessage}
        </Text>
      </Modal>
      <ReceiptView
        showReceipt={showReceipt}
        receipt={receipt}
        generalSettings={generalSettings}
        taxSettings={taxSettings}
        showAddTip={true}
        closeAction={() => navigation.navigate('menu')}
      />
    </Box>
  );
};

export default InvoiceView;
