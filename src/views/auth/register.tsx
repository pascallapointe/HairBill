import { Box, Heading, VStack } from 'native-base';
import React from 'react';
import { SafeAreaView } from 'react-native';
import Card from '@components/card';
import { useTranslation } from 'react-i18next';

const RegisterView = () => {
  const { t } = useTranslation();
  return (
    <Box
      style={{ flex: 1 }}
      bg={{
        linearGradient: {
          colors: ['fuchsia.400', 'violet.900'],
          start: [0, 0],
          end: [1, 0],
        },
      }}>
      <SafeAreaView
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <VStack space={4} alignItems="center">
          <Heading color="white" size="4xl" mb={4} fontFamily="SignPainter">
            &nbsp;Nouveau compte&nbsp;
          </Heading>
          <Card w="400px" titleAlign="center" alignItems="center">
            <VStack pb={2} space={2} alignItems="center">
              <Box p={4}>Hello</Box>
              <Box p={4}>Hello</Box>
              <Box p={4}>Hello</Box>
              <Box p={4}>Hello</Box>
              <Box p={4}>Hello</Box>
              <Box p={4}>Hello</Box>
            </VStack>
          </Card>
        </VStack>
      </SafeAreaView>
    </Box>
  );
};

export default RegisterView;
