import React, { forwardRef, memo, useImperativeHandle, useState } from 'react';
import {
  defaultReceipt,
  InvoiceType,
} from '@app/main/invoice/invoice.repository';
import ReceiptView from '@app/main/invoice/receipt-view';

export type ShowReceiptRefType = { viewReceipt: (r: InvoiceType) => void };

const ShowReceiptView = forwardRef<ShowReceiptRefType>(({}, ref) => {
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
      showAddTip={false}
      closeAction={() => setShowReceipt(false)}
    />
  );
});

export default memo(ShowReceiptView);
