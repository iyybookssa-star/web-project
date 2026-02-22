/**
 * generateReceipt(order) — creates and downloads a PDF receipt using jsPDF (loaded via CDN).
 * @param {Object} order  - The order object returned from POST /api/orders
 * @param {Object} user   - The logged-in user { name, email }
 */
export async function generateReceipt(order, user) {
  // Dynamically import jspdf
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const PAGE_W = 210;
  const MARGIN = 18;
  let y = 20;

  const grey = [100, 100, 100];
  const dark = [20, 20, 30];
  const primary = [57, 74, 226];
  const lightBg = [245, 246, 250];

  // ── Header bar ──────────────────────────────────────────
  doc.setFillColor(...primary);
  doc.rect(0, 0, PAGE_W, 38, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text('PARTIFY PRO', MARGIN, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('High-Performance Car Parts', MARGIN, 25);
  doc.text('partifypro.com  |  support@partifypro.com', MARGIN, 31);

  // Receipt label
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('ORDER RECEIPT', PAGE_W - MARGIN, 20, { align: 'right' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Order #${order._id?.slice(-8).toUpperCase() || 'N/A'}`, PAGE_W - MARGIN, 27, { align: 'right' });
  doc.text(`Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, PAGE_W - MARGIN, 33, { align: 'right' });

  y = 50;

  // ── Bill To ──────────────────────────────────────────────
  doc.setFillColor(...lightBg);
  doc.rect(MARGIN, y, PAGE_W - MARGIN * 2, 28, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...primary);
  doc.text('BILL TO', MARGIN + 4, y + 7);

  doc.setTextColor(...dark);
  doc.setFontSize(10);
  doc.text(user?.name || 'Customer', MARGIN + 4, y + 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...grey);
  doc.text(user?.email || '', MARGIN + 4, y + 20);

  // Delivery address (right side of the box)
  const addr = order.shippingAddress;
  const addrLines = [
    addr?.street || '',
    `${addr?.city || ''}, ${addr?.state || ''} ${addr?.zip || ''}`,
    addr?.country || '',
  ].filter(Boolean);

  // Vertical divider between Bill To and Deliver To
  doc.setDrawColor(220, 220, 220);
  doc.line(PAGE_W / 2, y + 4, PAGE_W / 2, y + 24);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...primary);
  doc.text('DELIVER TO', PAGE_W / 2 + 6, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...grey);
  const maxWidth = (PAGE_W / 2) - MARGIN - 8;
  let currentY = y + 14;
  
  addrLines.forEach((line) => {
    const splitText = doc.splitTextToSize(line, maxWidth);
    splitText.forEach(pt => {
        doc.text(pt, PAGE_W / 2 + 6, currentY);
        currentY += 5;
    });
  });

  y += 36;

  // ── Items table header ────────────────────────────────────
  doc.setFillColor(...primary);
  doc.rect(MARGIN, y, PAGE_W - MARGIN * 2, 9, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('ITEM', MARGIN + 3, y + 6);
  doc.text('QTY', PAGE_W - MARGIN - 46, y + 6, { align: 'right' });
  doc.text('UNIT PRICE', PAGE_W - MARGIN - 22, y + 6, { align: 'right' });
  doc.text('TOTAL', PAGE_W - MARGIN - 2, y + 6, { align: 'right' });

  y += 11;

  // ── Item rows ─────────────────────────────────────────────
  (order.items || []).forEach((item, idx) => {
    const rowBg = idx % 2 === 0 ? [255, 255, 255] : [249, 249, 252];
    doc.setFillColor(...rowBg);
    doc.rect(MARGIN, y, PAGE_W - MARGIN * 2, 9, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...dark);

    // Truncate long names
    const name = item.name?.length > 55 ? item.name.slice(0, 52) + '…' : item.name;
    doc.text(name, MARGIN + 3, y + 6);
    doc.text(String(item.qty), PAGE_W - MARGIN - 46, y + 6, { align: 'right' });
    doc.text(`$${Number(item.price).toFixed(2)}`, PAGE_W - MARGIN - 22, y + 6, { align: 'right' });
    doc.text(`$${(item.price * item.qty).toFixed(2)}`, PAGE_W - MARGIN - 2, y + 6, { align: 'right' });

    y += 10;
  });

  // ── Totals block ──────────────────────────────────────────
  y += 4;
  const totalsX = PAGE_W - MARGIN - 70;

  const drawRow = (label, value, isBold = false, color = dark) => {
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(isBold ? 11 : 9);
    doc.setTextColor(...color);
    doc.text(label, totalsX, y);
    doc.text(value, PAGE_W - MARGIN - 2, y, { align: 'right' });
    y += isBold ? 8 : 7;
  };

  // Divider
  doc.setDrawColor(...grey);
  doc.setLineWidth(0.3);
  doc.line(totalsX - 2, y - 2, PAGE_W - MARGIN, y - 2);
  y += 2;

  drawRow('Subtotal', `$${Number(order.itemsPrice).toFixed(2)}`);
  drawRow('Shipping', order.shippingPrice > 0 ? `$${Number(order.shippingPrice).toFixed(2)}` : 'FREE');
  drawRow('Tax', `$${Number(order.taxPrice).toFixed(2)}`);

  // Total divider
  doc.setDrawColor(...primary);
  doc.setLineWidth(0.5);
  doc.line(totalsX - 2, y - 1, PAGE_W - MARGIN, y - 1);
  y += 3;
  drawRow('TOTAL', `$${Number(order.totalPrice).toFixed(2)}`, true, primary);

  // ── Payment method badge ───────────────────────────────────
  y += 6;
  doc.setFillColor(230, 255, 240);
  doc.rect(MARGIN, y, 70, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(22, 163, 74);
  doc.text(`✓  Payment: ${order.paymentMethod || 'Cash on Delivery'}`, MARGIN + 3, y + 7);

  // ── Order status ──────────────────────────────────────────
  doc.setFillColor(219, 234, 254);
  doc.rect(MARGIN + 76, y, 50, 10, 'F');
  doc.setTextColor(...primary);
  doc.text(`Status: ${order.status || 'Pending'}`, MARGIN + 79, y + 7);

  // ── Footer ────────────────────────────────────────────────
  y = 272;
  doc.setDrawColor(...primary);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...grey);
  doc.text('Thank you for shopping with Partify Pro! For support, contact support@partifypro.com', PAGE_W / 2, y, { align: 'center' });
  doc.text('This is an automatically generated receipt. No signature required.', PAGE_W / 2, y + 5, { align: 'center' });

  // Save
  doc.save(`Partify-Receipt-${order._id?.slice(-8).toUpperCase() || 'ORDER'}.pdf`);
}
