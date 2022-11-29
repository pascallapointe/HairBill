import React, { useEffect, useState } from 'react';
import { Box, Button, Flex, ScrollView, Text, VStack } from 'native-base';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ListItem: React.FC<{
  item: number;
  bindAmount: (amount: number) => void;
}> = ({ item, bindAmount }) => {
  const { t } = useTranslation();
  return (
    <Button
      size="sm"
      colorScheme="violet"
      shadow={4}
      onPress={() => bindAmount(item)}
      m={1}>
      {t('price', { price: item.toFixed(2) })}
    </Button>
  );
};

const AmountList: React.FC<{
  bindAmount: (amount: number) => void;
  query: string;
}> = ({ query, bindAmount }) => {
  const { t } = useTranslation();
  const [amounts, setAmounts] = useState<number[]>([
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  ]);
  const [filtered, setFiltered] = useState<number[]>([]);

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
    const regex = new RegExp(query === '0' ? '' : query, 'gi');
    setFiltered(amounts.filter(amount => amount.toString().match(regex)));
  }, [amounts, query]);

  if (!filtered.length) {
    return (
      <Box height="150px" justifyContent="center" alignItems="center">
        <Text mb={5} fontSize="lg" color="muted.500">
          {t<string>('invoice.noMatch')}
        </Text>
      </Box>
    );
  }

  return (
    <VStack px={12} py={5} height="150px">
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
