import React, { useEffect, useState } from 'react';
import { Box, Button, Flex, ScrollView, Text, VStack } from 'native-base';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { escapeRegExp } from '@lib/utils';

export const defaultTipValues = [
  '0.00',
  '1.00',
  '2.00',
  '3.00',
  '4.00',
  '5.00',
  '6.00',
  '7.00',
  '8.00',
  '9.00',
  '10.00',
];

const ListItem: React.FC<{
  item: string;
  bindAmount: (amount: string) => void;
}> = ({ item, bindAmount }) => {
  const { t } = useTranslation();
  const mod = parseFloat(item) % 1;
  let color = 'purple.600';

  if (mod > 0.75) {
    color = 'violet.900';
  } else if (mod > 0.5) {
    color = 'violet.800';
  } else if (mod > 0.25) {
    color = 'violet.700';
  } else if (mod > 0) {
    color = 'violet.600';
  }

  return (
    <Button
      size="sm"
      bgColor={color}
      _pressed={{ opacity: 0.5 }}
      shadow={4}
      _text={{ fontWeight: 'bold' }}
      onPress={() => bindAmount(item)}
      m={1}>
      {t('price', { price: item })}
    </Button>
  );
};

const AmountList: React.FC<{
  bindAmount: (amount: string) => void;
  query: string;
}> = ({ query, bindAmount }) => {
  const { t } = useTranslation();
  const [amounts, setAmounts] = useState<string[]>([...defaultTipValues]);
  const [filtered, setFiltered] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem('lastTips')
      .then(value => {
        const lastAmounts = value ? JSON.parse(value) : [];
        const amountsSet = [...new Set([...amounts, ...lastAmounts])];
        amountsSet.sort((a, b) => a - b);
        setAmounts(amountsSet);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const regex = new RegExp(
      parseFloat(query) === 0 ? '' : escapeRegExp(query.replace(',', '.')),
      'gi',
    );
    setFiltered(amounts.filter(amount => amount.toString().match(regex)));
  }, [amounts, query]);

  if (!filtered.length) {
    return (
      <Box height="150px" justifyContent="center" alignItems="center">
        <Text m={5} fontSize="lg" color="muted.500">
          {t<string>('invoice.noMatch')}
        </Text>
      </Box>
    );
  }

  return (
    <VStack pl={1} pr={7} py={1} height="150px">
      <ScrollView keyboardShouldPersistTaps="always">
        <Flex direction="row" wrap="wrap">
          {filtered.map(amount => (
            <ListItem
              key={amount.toString()}
              item={amount}
              bindAmount={bindAmount}
            />
          ))}
        </Flex>
      </ScrollView>
    </VStack>
  );
};

export default AmountList;
