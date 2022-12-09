import React, { forwardRef, useImperativeHandle, useState } from 'react';
import {
  defaultReceipt,
  InvoiceType,
} from '@views/app/invoice/invoice.repository';
import { GeneralSettingsType } from '@views/app/options/general/general.repository';
import { TaxSettingsType } from '@views/app/options/sales-tax/sales-tax.repository';
import ReceiptView from '@views/app/invoice/receipt-view';

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
