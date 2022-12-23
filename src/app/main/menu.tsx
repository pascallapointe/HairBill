import React from 'react';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { Box, Flex, Heading } from 'native-base';
import { SafeAreaView } from 'react-native';
import NavButton from '@components/nav-button';
import { useTranslation } from 'react-i18next';
import {
  defaultGeneralSettings,
  defaultTaxSettings,
  getTaxSettings,
  TaxSettingsType,
} from '@app/main/options/sales-tax/sales-tax.repository';
import {
  GeneralSettingsType,
  getGeneralSettings,
} from '@app/main/options/general/general.repository';
import { getNextInvoiceNumber } from '@app/main/invoice/invoice.repository';

interface Props {
  navigation: NavigationProp<ParamListBase>;
}

export type SettingsType = {
  generalSettings: GeneralSettingsType;
  taxSettings: TaxSettingsType;
};

const MenuView: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();

  async function fetchSettings(): Promise<SettingsType> {
    const gS = getGeneralSettings();
    const tS = getTaxSettings();
    return {
      generalSettings: (await gS) ?? defaultGeneralSettings,
      taxSettings: (await tS) ?? defaultTaxSettings,
    };
  }

  async function gotoNewInvoice() {
    const settings = await fetchSettings();
    const invoiceNum = await getNextInvoiceNumber();
    navigation.navigate('invoice', { settings, invoiceNum });
  }

  async function gotoLists() {
    const settings = await fetchSettings();
    navigation.navigate('lists', { settings });
  }

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
            action={gotoNewInvoice}
            text={t('home.newInvoice')}
            icon="receipt"
          />
          <NavButton
            action={gotoLists}
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
