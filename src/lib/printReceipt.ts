export function printReceipt({
  hospital, patient, payment, invoice,
}: {
  hospital: { name: string; phone?: string };
  patient: { firstName: string; lastName: string; patientNumber: string };
  payment: { receiptNumber: string; amount: number; method: string; paymentReference?: string; createdAt: string; recordedBy?: { firstName: string; lastName: string } };
  invoice: { invoiceNumber: string; balance: number };
}) {
  const printWindow = window.open("", "_blank", "width=320,height=500");
  if (!printWindow) return;

  printWindow.document.write(`
    <html>
      <head>
        <title>Receipt</title>
        <style>
          @media print { body { margin: 0; padding: 0; } }
          body { font-family: monospace; font-size: 12px; padding: 10px; width: 58mm; }
          .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 6px; margin-bottom: 8px; }
          .header h2 { font-size: 14px; margin: 0; }
          .row { display: flex; justify-content: space-between; margin-bottom: 4px; }
          .total { border-top: 1px dashed #000; margin-top: 8px; padding-top: 6px; font-weight: bold; }
          .footer { border-top: 1px dashed #000; padding-top: 6px; margin-top: 10px; font-size: 9px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>${hospital.name}</h2>
          ${hospital.phone ? `<p>${hospital.phone}</p>` : ""}
          <p>PAYMENT RECEIPT</p>
        </div>
        <div class="row"><span>Receipt No.</span><span>${payment.receiptNumber}</span></div>
        <div class="row"><span>Invoice</span><span>${invoice.invoiceNumber}</span></div>
        <div class="row"><span>Patient</span><span>${patient.firstName} ${patient.lastName}</span></div>
        <div class="row"><span>Patient ID</span><span>${patient.patientNumber}</span></div>
        <div class="row"><span>Method</span><span>${payment.method}</span></div>
        ${payment.paymentReference ? `<div class="row"><span>Reference</span><span>${payment.paymentReference}</span></div>` : ""}
        <div class="row total"><span>Amount Paid</span><span>₦${payment.amount.toLocaleString()}</span></div>
        <div class="row"><span>Remaining Balance</span><span>₦${invoice.balance.toLocaleString()}</span></div>
        <div class="row"><span>Date</span><span>${new Date(payment.createdAt).toLocaleString()}</span></div>
        ${payment.recordedBy ? `<div class="row"><span>Recorded By</span><span>${payment.recordedBy.firstName} ${payment.recordedBy.lastName}</span></div>` : ""}
        <div class="footer">
          <div style="display:flex;align-items:center;justify-content:center;gap:4px;">
            <img src="${window.location.origin}/zensa-mark.png" style="width:10px;height:10px;" />
            <span>Powered by Zensa</span>
          </div>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
}