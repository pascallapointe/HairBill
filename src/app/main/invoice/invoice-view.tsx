import React, { useEffect, useRef, useState } from 'react';
import { Box, Center, Divider, Heading, Stack, Text, View } from 'native-base';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native';
import Card from '@components/card';
import ClientInput, {
  ClientInputRef,
  defaultClient,
} from '@app/main/invoice/client/client-input';
import { z } from 'zod';
import ProductsSelect, {
  ProductSelectRef,
} from '@app/main/invoice/products/products-select';
import Modal, { ModalRef } from '@components/modal';
import { roundTo } from '@lib/utils';
import TipInput, { TipInputRef } from '@app/main/invoice/tip/tip-input';
import {
  addInvoice,
  defaultReceipt,
  InvoiceType,
  updateInvoice,
  updateNote,
} from '@app/main/invoice/invoice.repository';
import ReceiptView from '@app/main/invoice/receipt-view';
import PayMethod, { PayMethodRef } from '@app/main/invoice/payment/pay-method';
import Total, { defaultAmount, TotalRef } from '@app/main/invoice/total/total';
import { ProductType } from '@app/main/services/product/product.repository';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { defaultTipValues } from '@app/main/invoice/tip/list';
import { NativeStackScreenProps } from 'react-native-screens/native-stack';
import { NavigatorParamList } from '@app/app-navigation';
import TextAreaInput, { TextAreaRef } from '@components/form/text-area-input';
import ActionButton from '@components/action-button';

interface Props extends NativeStackScreenProps<NavigatorParamList, 'invoice'> {}

const InvoiceView: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { invoice, settings, invoiceNum } = route.params;
  const clientField = useRef<ClientInputRef>(null);
  const productsField = useRef<ProductSelectRef>(null);
  const tipField = useRef<TipInputRef>(null);
  const paymentField = useRef<PayMethodRef>(null);
  const updateField = useRef<TextAreaRef>(null);
  const totalRef = useRef<TotalRef>(null);
  const [receipt, setReceipt] = useState<InvoiceType>({ ...defaultReceipt });
  const [showReceipt, setShowReceipt] = useState(false);

  // Modals
  const updateModal = useRef<ModalRef>(null);

  useEffect(() => {
    if (invoice) {
      navigation.setOptions({
        // @ts-ignore
        title: `HairBill - ${t('invoice.invoice')}# ${invoice.invoiceNumber}`,
      });
    }
  }, []);

  async function save(): Promise<boolean> {
    const fields = [
      clientField.current && clientField.current.validate(),
      productsField.current && productsField.current.validate(),
      tipField.current && tipField.current.validate(),
    ];
    if (fields.every(field => field)) {
      let r: InvoiceType;
      if (invoice === null) {
        r = addInvoice({
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
          updateNote: '',
          deleteNote: '',
          generalSettings: settings.generalSettings,
          taxSettings: settings.taxSettings,
        });
      } else {
        r = updateInvoice({
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          date: invoice.date,
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
          updatedAt: invoice.updatedAt ?? null,
          updateNote: invoice.updateNote ?? '',
          deletedAt: invoice.deletedAt ?? null,
          deleteNote: invoice.deleteNote ?? '',
          generalSettings: settings.generalSettings,
          taxSettings: settings.taxSettings,
        });
      }

      setReceipt(r);
      if (invoice === null) {
        setShowReceipt(true);
      } else {
        updateModal.current && updateModal.current.open();
      }

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

      // Keep save locked
      return true;
    } else {
      // Unlock save button
      return false;
    }
  }

  function saveUpdateNote(): void {
    if (invoice !== null && invoice.id && updateField.current) {
      const note = updateField.current.getValue();
      setReceipt({ ...receipt, updateNote: note });
      updateNote(invoice.id, note);
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
                    value={invoice ? invoice.client : { ...defaultClient }}
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
                  <Box
                    display={settings.taxSettings.includeTax ? 'flex' : 'none'}>
                    <Text top="2px" ml={4} fontSize="sm" color="muted.500">
                      ({t<string>('invoice.taxIncluded')})
                    </Text>
                  </Box>
                </Heading>
                <Divider mb={2} bg="violet.700" />
                <ProductsSelect
                  ref={productsField}
                  label={t<string>('invoice.selectedP&S')}
                  value={invoice ? invoice.products : []}
                  selectBind={productsSelectHandler}
                />
              </Box>
              <Box flex={1}>
                <Heading size="md" color="violet.700">
                  {t<string>('invoice.tip')}
                </Heading>
                <Divider mb={2} bg="violet.700" />
                <View zIndex={10}>
                  <TipInput
                    ref={tipField}
                    value={invoice ? invoice.tip.toFixed(2).toString() : '0.00'}
                  />
                </View>
                <Heading size="md" mt={2} color="violet.700">
                  {t<string>('invoice.payment')}
                </Heading>
                <Divider mb={2} bg="violet.700" />
                <PayMethod
                  ref={paymentField}
                  value={invoice ? invoice.payment : 'pending'}
                />
                <Heading size="md" mt={2} color="violet.700">
                  {t<string>('invoice.total')}
                </Heading>
                <Divider mb={2} bg="violet.700" />
                <Total
                  ref={totalRef}
                  taxSettings={settings.taxSettings}
                  initAmount={invoice ? invoice.total : defaultAmount}
                />
              </Box>
            </Stack>
            <Center>
              <ActionButton
                mt={2}
                text={t<string>('save')}
                colorScheme="violet"
                action={save}
                shadow={4}
              />
            </Center>
          </Box>
        </Card>
      </SafeAreaView>
      <Modal
        ref={updateModal}
        action={saveUpdateNote}
        hideClose={true}
        outClick={false}
        actionBtnText={t<string>('continue')}
        title={t('invoice.updateNote')}
        callback={() => setShowReceipt(true)}
        modalType="warning">
        <TextAreaInput
          ref={updateField}
          required={false}
          label="Note"
          value={invoice !== null ? invoice.updateNote : ''}
          placeholder={t<string>('invoice.updateNotePlaceholder')}
        />
      </Modal>
      <ReceiptView
        showReceipt={showReceipt}
        receipt={receipt}
        showAddTip={invoice === null}
        closeAction={
          invoice === null
            ? () => navigation.navigate('menu')
            : () =>
                navigation.navigate('lists', {
                  refresh: new Date().valueOf(),
                  settings,
                })
        }
      />
    </Box>
  );
};

export default InvoiceView;
