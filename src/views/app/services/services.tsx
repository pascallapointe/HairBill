import React, { useState } from 'react';
import { Box, Button, Heading, Icon } from 'native-base';
import { SafeAreaView } from 'react-native';
import { useTranslation } from 'react-i18next';
import Card from '@components/card';
import CategoryList from '@views/app/services/category/list';
import AddCategory from '@views/app/services/category/add';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';

const ServicesView = () => {
  const { t } = useTranslation();
  const [view, setView] = useState<'add' | 'list'>('list');

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
        <Card
          width="lg"
          title={
            view === 'list'
              ? t('services.categories')
              : t('services.addCategory')
          }
          options={
            view === 'list' ? (
              <Button
                onPress={() => setView('add')}
                endIcon={
                  <Icon
                    as={FontAwesome5Icon}
                    name="plus"
                    colorScheme="violet"
                  />
                }
                colorScheme="violet"
                shadow={4}>
                {t('add')}
              </Button>
            ) : (
              <Button
                onPress={() => setView('list')}
                colorScheme="violet"
                startIcon={
                  <Icon
                    as={FontAwesome5Icon}
                    name="chevron-left"
                    colorScheme="violet"
                  />
                }
                variant="outline">
                {t('back')}
              </Button>
            )
          }>
          {view === 'list' ? (
            <CategoryList />
          ) : (
            <AddCategory setParentView={setView} />
          )}
        </Card>
      </SafeAreaView>
    </Box>
  );
};

export default ServicesView;
