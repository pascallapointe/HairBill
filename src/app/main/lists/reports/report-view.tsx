import React, { useEffect, useState } from 'react';
import { Box, Skeleton } from 'native-base';
import { WebView } from 'react-native-webview';
import {
  getInvoicesRange,
  InvoiceType,
} from '@app/main/invoice/invoice.repository';
import { SafeAreaView } from 'react-native';
import { NativeStackScreenProps } from 'react-native-screens/native-stack';
import { NavigatorParamList } from '@app/app-navigation';
import RNPrint from 'react-native-print';
import ActionButton from '@components/action-button';
import { useTranslation } from 'react-i18next';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import { createTimestamp } from '@lib/utils';

interface Props extends NativeStackScreenProps<NavigatorParamList, 'report'> {}

const ReportView: React.FC<Props> = ({ route }) => {
  const { t } = useTranslation();
  const { start, end, include, format, quarter, settings } = route.params;
  const [init, setInit] = useState(true);
  const [html, setHtml] = useState<string>('');

  useEffect(() => {
    fetchInvoices().then().catch(console.error);
  }, []);

  async function fetchInvoices() {
    try {
      const result = await getInvoicesRange(start, end, include);

      setHtml(generateMarkup([...result]));

      setInit(false);
    } catch (e) {
      console.error(e);
    }
  }

  function sumInvoices(data: InvoiceType[]) {
    const result = {
      subtotal: 0,
      total: 0,
      showTaxA: false,
      taxA: 0,
      showTaxB: false,
      taxB: 0,
      tip: 0,
    };

    for (const row of data) {
      result.subtotal += row.total.subtotal;
      result.total += row.total.total;
      result.tip += row.tip;
      if (row.taxSettings.enabled) {
        result.showTaxA = true;
        result.taxA += row.total.taxA;
        if (row.taxSettings.useBTax) {
          result.showTaxB = true;
          result.taxB += row.total.taxB;
        }
      }
    }

    return result;
  }

  function generateMarkup(data: InvoiceType[]) {
    const sum = sumInvoices(data);
    let result = '';

    for (const i in data) {
      const row = data[i];
      result += `<tr class="${
        parseInt(i, 10) % 2 ? 'even' : 'odd'
      }"><td style="text-align: center">${createTimestamp(
        new Date(row.date),
      )}</td><td style="text-align: center; font-weight: bold">${
        row.invoiceNumber
      }</td><td style="text-align: right">${t('price', {
        price: row.total.subtotal.toFixed(2),
      })}</td><td style="text-align: right">${t('price', {
        price: row.total.total.toFixed(2),
      })}</td>`;
      if (sum.showTaxA) {
        result += `<td style="text-align: right">${t('price', {
          price: row.total.taxA.toFixed(2),
        })}</td>`;
      }
      if (sum.showTaxB) {
        result += `<td style="text-align: right">${t('price', {
          price: row.total.taxB.toFixed(2),
        })}</td>`;
      }
      result += `<td style="text-align: right">${t('price', {
        price: row.tip.toFixed(2),
      })}</td></tr>`;
    }

    result += `<tr class="footer">
          <td colspan="2" style="border-bottom: none; border-left: none;font-weight: bold;text-align: right;">Total:</td>
          <td style="text-align: right; border-left: 2px solid; border-bottom: 2px solid;font-weight: bold;">${t(
            'price',
            {
              price: sum.subtotal.toFixed(2),
            },
          )}</td><td style="text-align: right; border-bottom: 2px solid;font-weight: bold;">${t(
      'price',
      {
        price: sum.total.toFixed(2),
      },
    )}</td>`;
    if (sum.showTaxA) {
      result += `<td style="text-align: right; border-bottom: 2px solid;font-weight: bold;">${t(
        'price',
        {
          price: sum.taxA.toFixed(2),
        },
      )}</td>`;
    }
    if (sum.showTaxB) {
      result += `<td  style="text-align: right; border-bottom: 2px solid;font-weight: bold;">${t(
        'price',
        {
          price: sum.taxB.toFixed(2),
        },
      )}</td>`;
    }
    result += `<td style="text-align: right; border-bottom: 2px solid; border-right: 2px solid;font-weight: bold;">${t(
      'price',
      {
        price: sum.tip.toFixed(2),
      },
    )}</td></tr>`;

    const STYLES =
      '<style>table {border-collapse: collapse; width: 100%} td {border: 1px solid;padding: 2px 10px;} .odd td {background-color: #e5e5e5;}.footer td {border-top: 6px double;}thead {display: table-header-group;}</style>';

    let HEADER = `<h1 style="margin: 0 0;">${t<string>(
      'lists.report',
    )} - ${t<string>('lists.' + format)} ${
      format === 'quarterly' ? 'Q' + quarter : ''
    }</h1><h3 style="margin-top: 0; margin-bottom: 8px">${createTimestamp(
      new Date(start),
      false,
    )} ${t<string>('lists.to')} ${createTimestamp(new Date(end), false)}</h3>`;

    if (settings.taxSettings.enabled) {
      HEADER += `<h5 style="margin: 0 0">${settings.taxSettings.taxAName} ${
        settings.taxSettings.taxANumber.length ? ' #: ' : ''
      } ${settings.taxSettings.taxANumber}</h5>`;
    }

    if (settings.taxSettings.enabled && settings.taxSettings.useBTax) {
      HEADER += `<h5 style="margin: 0 0">${settings.taxSettings.taxBName} ${
        settings.taxSettings.taxBNumber.length ? ' #: ' : ''
      } ${settings.taxSettings.taxBNumber}</h5>`;
    }

    HEADER += `<h4 style="font-style: italic">${include
      .map(v => t<string>('lists.' + v))
      .join(', ')}</h4>`;

    const SUBHEADER = `<div style="float: right"><h3 style="margin: 0 0">${settings.generalSettings.shopName}</h3><h6 style="margin-top: 0; margin-bottom: 5px">${settings.generalSettings.address}</h6><h5 style="margin: 0 0; text-align: right;">${settings.generalSettings.employeeName}</h5><h5 style="margin: 0 0; text-align: right;">${settings.generalSettings.phone}</h5></div>`;

    let TABLEHEADER = `<thead><tr><th>Date</th><th>${
      t<string>('invoice.invoice') + ' #'
    }</th><th>${t<string>('invoice.subtotal')}</th><th>${t<string>(
      'invoice.total',
    )}</th>`;
    if (sum.showTaxA) {
      TABLEHEADER += `<th>${settings.taxSettings.taxAName}</th>`;
    }
    if (sum.showTaxB) {
      TABLEHEADER += `<th>${settings.taxSettings.taxBName}</th>`;
    }
    TABLEHEADER += `<th>${t<string>('invoice.tip')}</th></tr></thead>`;

    return `${STYLES}${SUBHEADER}${HEADER}<table>${TABLEHEADER}<tbody>${result}</tbody></table>`;
  }

  async function print(): Promise<boolean> {
    await RNPrint.print({ html });
    return false;
  }

  if (init) {
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
          <Skeleton mb={4} rounded={10} width="200px" height="50px" />
          <Skeleton
            rounded={10}
            width={{ md: '700px', lg: '900px' }}
            height={{ md: '800px', lg: '600px' }}
          />
        </SafeAreaView>
      </Box>
    );
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
        <Box>
          <ActionButton
            maxW={200}
            mb={4}
            text={t<string>('lists.print') + ' - AirPrint'}
            action={print}
            leftIcon={<FontAwesome5Icon color="white" size={20} name="wifi" />}
            colorScheme="violet"
          />
        </Box>
        <Box
          backgroundColor={'white'}
          p={2}
          rounded={10}
          width={{ md: '700px', lg: '900px' }}
          height={{ md: '800px', lg: '600px' }}>
          <WebView originWhitelist={['*']} source={{ html }} />
        </Box>
      </SafeAreaView>
    </Box>
  );
};

export default ReportView;
