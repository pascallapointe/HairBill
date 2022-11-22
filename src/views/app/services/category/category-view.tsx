import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import { Button, Icon } from 'native-base';
import Card from '@components/card';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import CategoryList from '@views/app/services/category/list';
import AddCategory from '@views/app/services/category/add';

const CategoryView = () => {
  const { t } = useTranslation();
  const [view, setView] = useState<'add' | 'list'>('list');

  return (
    <Card
      maxHeight={{ md: '380px', lg: '570px' }}
      width="lg"
      title={
        view === 'list'
          ? t<string>('services.categories')
          : t<string>('services.addCategory')
      }
      options={
        view === 'list' ? (
          <Button
            onPress={() => setView('add')}
            endIcon={
              <Icon as={FontAwesome5Icon} name="plus" colorScheme="violet" />
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
  );
};

export default CategoryView;
