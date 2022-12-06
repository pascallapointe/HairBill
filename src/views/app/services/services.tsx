import React, { useState } from 'react';
import { Box, HStack, KeyboardAvoidingView } from 'native-base';
import { Platform, SafeAreaView } from 'react-native';
import CategoryView from '@views/app/services/category/category-view';
import ProductView from '@views/app/services/product/product-view';
import TabButton from '@components/tab-button';
import { useTranslation } from 'react-i18next';

const ServicesView = () => {
  const { t } = useTranslation();
  const [view, setView] = useState<'category' | 'product'>('product');
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
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'position' : 'height'}>
          <HStack justifyContent="center" space={4} mb={5}>
            <TabButton
              text={t<string>('services.products')}
              action={() => setView('product')}
              selected={view === 'product'}
            />
            <TabButton
              text={t<string>('services.categories')}
              action={() => setView('category')}
              selected={view === 'category'}
            />
          </HStack>
          {view === 'product' ? <ProductView /> : <CategoryView />}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Box>
  );
};

export default ServicesView;
