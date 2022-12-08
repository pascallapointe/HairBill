import React from 'react';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { Box, Flex, Heading } from 'native-base';
import { SafeAreaView } from 'react-native';
import NavButton from '@components/nav-button';
import { useTranslation } from 'react-i18next';

interface Props {
  navigation: NavigationProp<ParamListBase>;
}

const MenuView: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();

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
        <Heading color="white" size="4xl" mb={4} fontFamily="SignPainter">
          &nbsp;Menu&nbsp;
        </Heading>
        <Flex direction="row" wrap="wrap" justify="center" maxWidth="500px">
          <NavButton
            action={() => navigation.navigate('invoice')}
            text={t('home.newInvoice')}
            icon="receipt"
          />
          <NavButton
            action={() => navigation.navigate('lists')}
            text={t('home.listsReports')}
            icon="list"
          />
          <NavButton
            action={() => navigation.navigate('services')}
            text={t('home.services')}
            icon="store"
          />
          <NavButton
            action={() => navigation.navigate('options')}
            text={t('home.options')}
            icon="cogs"
          />
        </Flex>
      </SafeAreaView>
    </Box>
  );
};

export default MenuView;
