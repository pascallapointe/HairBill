import React, { useEffect, useRef, useState } from 'react';
import { Box, Center, Divider, Heading, HStack } from 'native-base';
import FormatPicker from '@app/main/lists/reports/menu/format-picker';
import Card from '@components/card';
import { useTranslation } from 'react-i18next';
import YearPicker, {
  YearPickerRef,
} from '@app/main/lists/reports/menu/year-picker';
import MonthPicker, {
  MonthPickerRef,
} from '@app/main/lists/reports/menu/month-picker';
import InclusionPicker, {
  InclusionPickerRef,
} from '@app/main/lists/reports/menu/inclusion-picker';
import type { ReportFormatType } from '@app/main/lists/reports/menu/format-picker';
import { NativeStackScreenProps } from 'react-native-screens/native-stack';
import { NavigatorParamList } from '@app/app-navigation';
import ActionButton from '@components/action-button';
import QuarterPicker, {
  QuarterPickerRef,
} from '@app/main/lists/reports/menu/quarter-picker';
import { generateTimeRange } from '@lib/utils';
import {
  defaultGeneralSettings,
  defaultTaxSettings,
  getTaxSettings,
} from '@app/main/options/sales-tax/sales-tax.repository';
import { getGeneralSettings } from '@app/main/options/general/general.repository';
import { SettingsType } from '@app/main/menu';

interface Props extends NativeStackScreenProps<NavigatorParamList, 'lists'> {}

const MenuView: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const [init, setInit] = useState(true);
  const [settings, setSettings] = useState<SettingsType>({
    generalSettings: defaultGeneralSettings,
    taxSettings: defaultTaxSettings,
  });
  const [format, setFormat] = useState<ReportFormatType>('annual');
  const yearField = useRef<YearPickerRef>(null);
  const monthField = useRef<MonthPickerRef>(null);
  const quarterField = useRef<QuarterPickerRef>(null);
  const inclusionsField = useRef<InclusionPickerRef>(null);

  useEffect(() => {
    fetchSettings()
      .then((res: SettingsType) => {
        const s = {
          generalSettings: res.generalSettings,
          taxSettings: res.taxSettings,
        };

        setSettings(s);
        setInit(false);
      })
      .catch(console.error);
  }, []);

  async function fetchSettings(): Promise<SettingsType> {
    const gS = getGeneralSettings();
    const tS = getTaxSettings();
    return {
      generalSettings: (await gS) ?? defaultGeneralSettings,
      taxSettings: (await tS) ?? defaultTaxSettings,
    };
  }

  function setReportFormat(value: ReportFormatType) {
    setFormat(value);
  }

  async function generate(): Promise<boolean> {
    let range: { startTime: number; endTime: number };

    if (
      !yearField.current ||
      !monthField.current ||
      !quarterField.current ||
      !inclusionsField.current
    ) {
      return false;
    }

    const fields = [inclusionsField.current.validate()];
    if (fields.every(field => field)) {
      switch (format) {
        case 'quarterly':
          range = generateTimeRange(
            yearField.current.getValue(),
            monthField.current.getValue(),
            false,
            quarterField.current.getValue(),
          );
          break;
        case 'monthly':
          range = generateTimeRange(
            yearField.current.getValue(),
            monthField.current.getValue(),
            true,
          );
          break;
        case 'custom':
        default:
          range = generateTimeRange(
            yearField.current.getValue(),
            monthField.current.getValue(),
          );
      }

      const inclusions =
        inclusionsField.current && inclusionsField.current.getValue();

      navigation.navigate('report', {
        start: range.startTime,
        end: range.endTime,
        include: inclusions ?? [],
        format,
        quarter: quarterField.current.getValue(),
        settings,
      });
      return false;
    } else {
      return false;
    }
  }

  return (
    <Card
      width={{ md: '700px', lg: '1000px' }}
      title={t<string>('lists.reportParameters')}
      pb={4}>
      <Heading size="md" mt={2} color="violet.700" textAlign="center">
        {t<string>('lists.reportType')}
      </Heading>
      <Divider mb={2} bg="violet.700" />
      <FormatPicker value={format} setFormat={setReportFormat} />
      <HStack justifyContent="center" flexWrap={'wrap'}>
        <Box
          display={format !== 'custom' ? 'flex' : 'none'}
          mx={2}
          alignItems="center">
          <Heading size="md" mt={2} color="violet.700">
            {t<string>('lists.targetYear')}
          </Heading>
          <Divider mb={2} bg="violet.700" />
          <YearPicker ref={yearField} value={new Date().getFullYear()} />
        </Box>
        <Box
          display={format !== 'custom' ? 'flex' : 'none'}
          mx={2}
          alignItems="center">
          <Heading size="md" mt={2} color="violet.700">
            {t<string>(
              format === 'monthly' ? 'lists.targetMonth' : 'lists.fiscalStart',
            )}
          </Heading>
          <Divider mb={2} bg="violet.700" />
          <MonthPicker
            ref={monthField}
            value={format === 'monthly' ? new Date().getMonth() + 1 : 1}
          />
        </Box>
        <Box
          display={format === 'quarterly' ? 'flex' : 'none'}
          mx={2}
          alignItems="center">
          <Heading size="md" mt={2} color="violet.700">
            {t<string>('lists.targetQuarter')}
          </Heading>
          <Divider mb={2} bg="violet.700" />
          <QuarterPicker ref={quarterField} value={1} />
        </Box>
        <Box mx={2} alignItems="center">
          <Heading size="md" mt={2} color="violet.700">
            {t<string>('lists.include')}
          </Heading>

          <Divider mb={2} bg="violet.700" />
          <InclusionPicker ref={inclusionsField} />
        </Box>
      </HStack>
      <Center>
        <ActionButton
          wait={init}
          mt={4}
          colorScheme="violet"
          shadow={4}
          text={t<string>('lists.generate')}
          action={generate}
        />
      </Center>
    </Card>
  );
};

export default MenuView;
