import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Box, HStack, Skeleton, Text, VStack } from 'native-base';
import { useTranslation } from 'react-i18next';
import { TaxSettingsType } from '@app/main/options/sales-tax/sales-tax.repository';
import { AmountType } from '@app/main/invoice/invoice.repository';
import { ProductType } from '@app/main/services/product/product.repository';
import { roundTo } from '@lib/utils';

export const defaultAmount = {
  subtotal: 0,
  total: 0,
  taxA: 0,
  taxB: 0,
};

interface Props {
  init: boolean;
  taxSettings: TaxSettingsType;
}

export type TotalRef = {
  calculate: (products: ProductType[]) => void;
  getValue: () => AmountType;
};

const Loading = () => (
  <VStack>
    <HStack mb={1} justifyContent="space-between">
      <Skeleton h="20px" width="150px" rounded={10} startColor="violet.400" />
      <Skeleton h="20px" width="80px" rounded={10} />
    </HStack>
    <HStack mb={1} justifyContent="space-between">
      <Skeleton h="20px" width="180px" rounded={10} startColor="violet.400" />
      <Skeleton h="20px" width="50px" rounded={10} />
    </HStack>
    <HStack mb={1} justifyContent="space-between">
      <Skeleton h="20px" width="160px" rounded={10} startColor="violet.400" />
      <Skeleton h="20px" width="50px" rounded={10} />
    </HStack>
    <HStack mb={1} justifyContent="space-between">
      <Skeleton h="20px" width="120px" rounded={10} startColor="violet.400" />
      <Skeleton h="20px" width="100px" rounded={10} />
    </HStack>
  </VStack>
);

const Total = forwardRef<TotalRef, Props>(({ init, taxSettings }, ref) => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState<AmountType>({ ...defaultAmount });

  useImperativeHandle(ref, () => ({
    calculate,
    getValue,
  }));

  function getValue(): AmountType {
    return amount;
  }

  function calculate(products: ProductType[]) {
    const a = { ...defaultAmount };
    for (const product of products) {
      a.total += product.price * product.quantity!;
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
  }

  if (init) {
    return <Loading />;
  }

  return (
    <Box>
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
              <Text top={1} fontSize="2xs" fontWeight="bold" color="muted.500">
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
            <Text top={1} fontSize="2xs" fontWeight="bold" color="muted.500">
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
  );
});

export default Total;
