import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Button, Flex, Icon } from 'native-base';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';

export type PaymentMethodType = 'pending' | 'cash' | 'transfer' | 'check';

export type PayMethodRef = {
  getValue: () => PaymentMethodType;
};

const PayMethod = forwardRef<PayMethodRef, { value?: PaymentMethodType }>(
  ({ value = 'pending' }, ref) => {
    const { t } = useTranslation();
    useImperativeHandle(ref, () => ({ getValue }));
    const [paymentFormat, setPaymentFormat] =
      useState<PaymentMethodType>(value);

    function getValue(): PaymentMethodType {
      return paymentFormat;
    }

    return (
      <Flex py={2} direction="row" wrap="wrap" justifyContent="center">
        <Button
          m={2}
          leftIcon={
            paymentFormat === 'cash' ? (
              <Icon as={FontAwesomeIcon} name="check" />
            ) : undefined
          }
          size="md"
          minW="120px"
          colorScheme={paymentFormat === 'cash' ? 'lime' : 'muted'}
          shadow={4}
          onPress={() => setPaymentFormat('cash')}>
          {t<string>('invoice.cash')}
        </Button>
        <Button
          m={2}
          leftIcon={
            paymentFormat === 'transfer' ? (
              <Icon as={FontAwesomeIcon} name="check" />
            ) : undefined
          }
          size="md"
          minW="120px"
          colorScheme={paymentFormat === 'transfer' ? 'lime' : 'muted'}
          shadow={4}
          onPress={() => setPaymentFormat('transfer')}>
          {t<string>('invoice.transfer')}
        </Button>
        <Button
          m={2}
          leftIcon={
            paymentFormat === 'check' ? (
              <Icon as={FontAwesomeIcon} name="check" />
            ) : undefined
          }
          size="md"
          minW="120px"
          colorScheme={paymentFormat === 'check' ? 'lime' : 'muted'}
          shadow={4}
          onPress={() => setPaymentFormat('check')}>
          {t<string>('invoice.check')}
        </Button>
        <Button
          m={2}
          leftIcon={
            paymentFormat === 'pending' ? (
              <Icon as={FontAwesomeIcon} name="check" />
            ) : undefined
          }
          size="md"
          minW="120px"
          colorScheme={paymentFormat === 'pending' ? 'amber' : 'muted'}
          shadow={4}
          onPress={() => setPaymentFormat('pending')}>
          {t<string>('invoice.pending')}
        </Button>
      </Flex>
    );
  },
);

export default PayMethod;
