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
  const [invoiceNum, setInvoiceNum] = useState('');

  useEffect(() => {
    if (init) {
      fetchSettings().then(
        (res: { settings: SettingsType; invoiceNum: string }) => {
          const s = {
            generalSettings: res.settings.generalSettings,
            taxSettings: res.settings.taxSettings,
          };
          const iN = res.invoiceNum;
          setSettings(s);
          setInvoiceNum(iN);
          setInit(false);
        },
      );
    }
  });

  async function fetchSettings(): Promise<{
    settings: SettingsType;
    invoiceNum: string;
  }> {
    const gS = getGeneralSettings();
    const tS = getTaxSettings();
    const iN = getNextInvoiceNumber();
    return {
      settings: {
        generalSettings: (await gS) ?? defaultGeneralSettings,
        taxSettings: (await tS) ?? defaultTaxSettings,
      },
      invoiceNum: (await iN) ?? '',
    };
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
            action={() =>
              navigation.navigate('invoice', { settings, invoiceNum })
            }
            text={t('home.newInvoice')}
            icon="receipt"
          />
          <NavButton
            action={() => navigation.navigate('lists', { settings })}
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
