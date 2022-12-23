import React, { useEffect, useState } from 'react';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { Box, Flex, Heading, Skeleton } from 'native-base';
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

const Loading = () => (
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
        {[1, 2, 3, 4].map(v => (
          <Skeleton
            key={v}
            m={4}
            height="180px"
            width="200px"
            shadow={6}
            startColor="violet.800"
          />
        ))}
      </Flex>
    </SafeAreaView>
  </Box>
);

const MenuView: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const [init, setInit] = useState(true);
  const [settings, setSettings] = useState<SettingsType>({
    generalSettings: defaultGeneralSettings,
    taxSettings: defaultTaxSettings,
  });

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refreshSettings();
    });

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe;
  }, [navigation]);

  function refreshSettings(): void {
    fetchSettings().then((res: SettingsType) => {
      const s = {
        generalSettings: res.generalSettings,
        taxSettings: res.taxSettings,
      };

      setSettings(s);
      setInit(false);
    });
  }

  async function fetchSettings(): Promise<SettingsType> {
    const gS = getGeneralSettings();
    const tS = getTaxSettings();
    return {
      generalSettings: (await gS) ?? defaultGeneralSettings,
      taxSettings: (await tS) ?? defaultTaxSettings,
    };
  }

  async function gotoNewInvoice(): Promise<void> {
    const invoiceNum = await getNextInvoiceNumber();
    navigation.navigate('invoice', { settings, invoiceNum });
  }

  if (init) {
    return <Loading />;
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
            action={async () => navigation.navigate('lists', { settings })}
            text={t('home.listsReports')}
            icon="list"
          />
          <NavButton
            action={async () => navigation.navigate('services')}
            text={t('home.services')}
            icon="store"
          />
          <NavButton
            action={async () => navigation.navigate('options')}
            text={t('home.options')}
            icon="cogs"
          />
        </Flex>
      </SafeAreaView>
    </Box>
  );
};

export default MenuView;
