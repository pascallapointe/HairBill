import React, { forwardRef, useImperativeHandle, useState } from 'react';
import {
  defaultReceipt,
  InvoiceType,
} from '@app/main/invoice/invoice.repository';
import { GeneralSettingsType } from '@app/main/options/general/general.repository';
import { TaxSettingsType } from '@app/main/options/sales-tax/sales-tax.repository';
import ReceiptView from '@app/main/invoice/receipt-view';

export type ShowReceiptRefType = { viewReceipt: (r: InvoiceType) => void };

const ShowReceiptView = forwardRef<
  ShowReceiptRefType,
  { generalSettings: GeneralSettingsType; taxSettings: TaxSettingsType }
>(({ generalSettings, taxSettings }, ref) => {
  const [receipt, setReceipt] = useState<InvoiceType>({ ...defaultReceipt });
  const [showReceipt, setShowReceipt] = useState(false);

  function viewReceipt(r: InvoiceType): void {
    setReceipt(r);
    setShowReceipt(true);
  }

  useImperativeHandle(ref, () => ({ viewReceipt }));

  return (
    <ReceiptView
      showReceipt={showReceipt}
      receipt={receipt}
      generalSettings={generalSettings}
      taxSettings={taxSettings}
      showAddTip={false}
      closeAction={() => setShowReceipt(false)}
    />
  );
});

export default ShowReceiptView;
