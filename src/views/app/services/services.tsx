import React from 'react';
import { Box, Heading, Stack } from 'native-base';
import { SafeAreaView } from 'react-native';
import CategoryView from '@views/app/services/category/category-view';
import ProductView from '@views/app/services/product/product-view';

const ServicesView = () => {
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
        <Heading color="white" size="4xl" mb={4} fontFamily="SignPainter">
          &nbsp;Services&nbsp;
        </Heading>
        <Stack direction={{ md: 'column', lg: 'row' }} space={3}>
          <Box>
            <CategoryView />
          </Box>
          <Box>
            <ProductView />
          </Box>
        </Stack>
      </SafeAreaView>
    </Box>
  );
};

export default ServicesView;
