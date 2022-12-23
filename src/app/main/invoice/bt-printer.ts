import {
  BLEPrinter,
  ColumnAliment,
  COMMANDS,
  IBLEPrinter,
} from 'react-native-thermal-receipt-printer-image-qr';
import { InvoiceType } from '@app/main/invoice/invoice.repository';
import { ProductSectionMapType } from '@app/main/services/product/product.repository';
import { createTimestamp } from '@lib/utils';

export class BTPrinter {
  private printers: IBLEPrinter[] = [];

  async init(): Promise<void> {
    await this.loadAvailablePrinters();
  }

  getPrinters(): IBLEPrinter[] {
    return this.printers;
  }

  async setCurrentPrinter(printer: IBLEPrinter): Promise<void> {
    try {
      await BLEPrinter.connectPrinter(printer.inner_mac_address);
      // Delay to allow bluetooth connection
      await new Promise<null>(res => setTimeout(() => res(null), 3000));
    } catch (e) {
      console.error('PRINTER_CONNEXION_FAILED');
    }
  }

  async closeConnexion() {
    try {
      await BLEPrinter.closeConn();
    } catch (e) {
      console.error(e);
    }
  }

  async loadAvailablePrinters(): Promise<IBLEPrinter[]> {
    let printerList: IBLEPrinter[] = [];

    try {
      await BLEPrinter.init();

      // Wait 3 seconds for a printer, then stop searching
      const p1 = new Promise<IBLEPrinter[]>(res =>
        res(BLEPrinter.getDeviceList()),
      );
      const p2 = new Promise<IBLEPrinter[]>(res =>
        setTimeout(() => res([]), 3000),
      );
      printerList = await Promise.race([p1, p2]);

      this.printers = printerList;
    } catch (e) {
      console.error(e);
    }

    return printerList;
  }

  async printReceipt(
    receipt: InvoiceType,
    products: ProductSectionMapType,
    tip: number,
    t: (str: string, opt?: { [key: string]: any }) => string,
  ): Promise<void> {
    console.log('Printing...');

    /**
     * Each column take 1 spacing
     * ie: 2 columns: 29 chars left, 3 columns: 28 chars left
     */
    const paperWidth = 30;
    const divider = '--------------------------------';
    const col = {
      left: ColumnAliment.LEFT,
      center: ColumnAliment.CENTER,
      right: ColumnAliment.RIGHT,
    };

    // Header
    BLEPrinter.printColumnsText(
      [t('invoice.invoice')],
      [paperWidth],
      [col.center],
      [
        COMMANDS.TEXT_FORMAT.TXT_FONT_A +
          COMMANDS.TEXT_FORMAT.TXT_BOLD_ON +
          COMMANDS.TEXT_FORMAT.TXT_2HEIGHT,
      ],
    );

    // Shop details
    if (receipt.generalSettings.shopName.length) {
      BLEPrinter.printColumnsText(
        [receipt.generalSettings.shopName],
        [paperWidth],
        [col.center],
        [COMMANDS.TEXT_FORMAT.TXT_FONT_A + COMMANDS.TEXT_FORMAT.TXT_BOLD_ON],
      );
    }
    if (receipt.generalSettings.phone.length) {
      BLEPrinter.printColumnsText(
        [receipt.generalSettings.phone],
        [paperWidth],
        [col.center],
        [COMMANDS.TEXT_FORMAT.TXT_FONT_C + COMMANDS.TEXT_FORMAT.TXT_BOLD_ON],
      );
    }
    if (receipt.generalSettings.address.length) {
      BLEPrinter.printColumnsText(
        [receipt.generalSettings.address],
        [paperWidth],
        [col.center],
        [COMMANDS.TEXT_FORMAT.TXT_FONT_B],
      );
    }
    if (receipt.generalSettings.employeeName.length) {
      BLEPrinter.printColumnsText(
        [receipt.generalSettings.employeeName],
        [paperWidth],
        [col.center],
        [COMMANDS.TEXT_FORMAT.TXT_FONT_C + COMMANDS.TEXT_FORMAT.TXT_BOLD_ON],
      );
    }

    // Invoice # & Date
    BLEPrinter.printColumnsText(
      [
        `#${t('invoice.invoice')}:`,
        receipt.invoiceNumber,
        createTimestamp(new Date(receipt.date)),
      ],
      [10, 8, 12],
      [col.left, col.left, col.right],
      ['', '', ''],
    );

    // Client
    BLEPrinter.printColumnsText(
      [`${t('invoice.client')}:`, receipt.client.name],
      [7, paperWidth - 7],
      [col.left, col.left],
      ['', ''],
    );

    // Products Header
    BLEPrinter.printText(
      `${t('invoice.productsAndServices')}\n${
        receipt.taxSettings.includeTax
          ? '(' + t('invoice.taxIncluded') + ')\n'
          : divider
      }${receipt.taxSettings.includeTax ? divider : ''}`,
    );

    for (const id in products) {
      BLEPrinter.printColumnsText(
        [products[id].name, ' '],
        [paperWidth, 1],
        [col.left, col.right],
        [COMMANDS.TEXT_FORMAT.TXT_BOLD_ON],
      );
      for (const p of products[id].products) {
        BLEPrinter.printColumnsText(
          [
            '- ' + p.name,
            p.quantity + 'x',
            t('price', { price: p.price.toFixed(2) }),
          ],
          [paperWidth - (8 + 4), 4, 8],
          [col.left, col.right, col.right],
          ['', '', ''],
        );
      }
    }

    // Total Header
    BLEPrinter.printText(`${t('invoice.total')}\n${divider}`);

    if (receipt.taxSettings.enabled) {
      BLEPrinter.printColumnsText(
        [
          t('invoice.subtotal'),
          t('price', { price: receipt.total.subtotal.toFixed(2) }),
        ],
        [paperWidth - 10, 10],
        [col.left, col.right],
        ['', ''],
      );
      BLEPrinter.printColumnsText(
        [
          receipt.taxSettings.taxAName + ' ' + receipt.taxSettings.taxANumber,
          t('price', { price: receipt.total.taxA.toFixed(2) }),
        ],
        [paperWidth - 8, 8],
        [col.left, col.right],
        ['', ''],
      );
      if (receipt.taxSettings.useBTax) {
        BLEPrinter.printColumnsText(
          [
            receipt.taxSettings.taxBName + ' ' + receipt.taxSettings.taxBNumber,
            t('price', { price: receipt.total.taxB.toFixed(2) }),
          ],
          [paperWidth - 8, 8],
          [col.left, col.right],
          ['', ''],
        );
      }
    }
    BLEPrinter.printColumnsText(
      [
        t('invoice.total'),
        t('price', { price: receipt.total.total.toFixed(2) }),
      ],
      [paperWidth - 10, 10],
      [col.left, col.right],
      [COMMANDS.TEXT_FORMAT.TXT_BOLD_ON, COMMANDS.TEXT_FORMAT.TXT_BOLD_ON],
    );

    BLEPrinter.printText(divider);

    // Payment mode

    BLEPrinter.printColumnsText(
      [t('invoice.paymentMethod') + ':', t('invoice.' + receipt.payment)],
      [paperWidth - 12, 12],
      [col.left, col.right],
      [COMMANDS.TEXT_FORMAT.TXT_BOLD_ON, COMMANDS.TEXT_FORMAT.TXT_BOLD_OFF],
    );

    if (tip > 0) {
      BLEPrinter.printColumnsText(
        [t('invoice.tip') + ':', t('price', { price: tip.toFixed(2) })],
        [paperWidth - 8, 8],
        [col.left, col.right],
        [COMMANDS.TEXT_FORMAT.TXT_BOLD_ON, COMMANDS.TEXT_FORMAT.TXT_BOLD_OFF],
      );
    }

    if (receipt.deletedAt) {
      BLEPrinter.printColumnsText(
        [
          t('invoice.deletedOn') + ':',
          createTimestamp(new Date(receipt.deletedAt)),
        ],
        [13, paperWidth - 13],
        [col.left, col.right],
        [COMMANDS.TEXT_FORMAT.TXT_BOLD_ON, COMMANDS.TEXT_FORMAT.TXT_BOLD_OFF],
      );
    }

    if (receipt.updatedAt && receipt.deletedAt === null) {
      BLEPrinter.printColumnsText(
        [
          t('invoice.updatedOn') + ':',
          createTimestamp(new Date(receipt.updatedAt)),
        ],
        [13, paperWidth - 13],
        [col.left, col.right],
        [COMMANDS.TEXT_FORMAT.TXT_BOLD_ON, COMMANDS.TEXT_FORMAT.TXT_BOLD_OFF],
      );
    }

    if (
      (receipt.updatedAt && receipt.updateNote.length && !receipt.deletedAt) ||
      (receipt.deletedAt && receipt.deleteNote.length)
    ) {
      BLEPrinter.printColumnsText(
        ['Note :', receipt.deletedAt ? receipt.deleteNote : receipt.updateNote],
        [7, paperWidth - 7],
        [col.left, col.left],
        [COMMANDS.TEXT_FORMAT.TXT_BOLD_ON, COMMANDS.TEXT_FORMAT.TXT_BOLD_OFF],
      );
    }

    // End
    BLEPrinter.printColumnsText(
      [t('invoice.thankYou')],
      [paperWidth],
      [col.center],
      [
        COMMANDS.TEXT_FORMAT.TXT_BOLD_ON +
          COMMANDS.TEXT_FORMAT.TXT_FONT_C +
          COMMANDS.TEXT_FORMAT.TXT_2HEIGHT,
      ],
    );
    BLEPrinter.printText('');

    // 5 Second delay
    await new Promise<null>(res => setTimeout(() => res(null), 5000));

    console.log('Printing sequence completed.');
  }
}
