import { formatCurrency } from '../../../utils/formatters';

// Vietnamese number reading utility
const readGroup = (group) => {
  const readDigit = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  const temp = [];
  if (group === '000') return [];

  const hundreds = parseInt(group[0]);
  const tens = parseInt(group[1]);
  const units = parseInt(group[2]);

  // Hundreds
  if (hundreds !== 0) {
    temp.push(readDigit[hundreds]);
    temp.push('trăm');
  }

  // Tens
  if (tens === 0) {
    if (units !== 0 && hundreds !== 0) { // Only add 'lẻ' if there are hundreds and units, but no tens
      temp.push('lẻ');
    }
  } else if (tens === 1) {
    temp.push('mười');
  } else {
    temp.push(readDigit[tens]);
    temp.push('mươi');
  }

  // Units
  if (tens === 0 && units === 0) {
    // do nothing
  } else if (tens === 0 && units !== 0) {
    temp.push(readDigit[units]);
  } else if (tens === 1 && units === 1) {
    temp.push('một');
  } else if (tens > 1 && units === 1) {
    temp.push('mốt');
  } else if (tens > 0 && units === 5) {
    temp.push('lăm');
  } else if (units !== 0) {
    temp.push(readDigit[units]);
  }

  return temp;
};

const readMoney = (number) => {
  if (!number || number === 0) return 'Không đồng';

  let str = Math.abs(number).toString(); // Handle negative numbers by converting to positive for reading
  const groups = [];
  let i = str.length;

  while (i > 0) {
    const start = Math.max(0, i - 3);
    groups.unshift(str.slice(start, i).padStart(3, '0'));
    i -= 3;
  }

  const suffixes = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];
  const words = [];

  for (let j = 0; j < groups.length; j++) {
    const group = groups[j];
    const groupWords = readGroup(group);
    const suffix = suffixes[groups.length - 1 - j];

    if (groupWords.length > 0) {
      words.push(...groupWords);
      if (suffix) { // Only add suffix if it's not empty
        words.push(suffix);
      }
    }
  }

  let result = words.join(' ').trim();

  // Clean up common issues like "không trăm lẻ không" or "không trăm không"
  result = result.replace(/không trăm lẻ không/g, 'không');
  result = result.replace(/không trăm không/g, 'không');
  result = result.replace(/lẻ không/g, 'không');
  result = result.replace(/không trăm/g, ''); // Remove "không trăm" if it's at the beginning of a group and not followed by anything else

  // Remove redundant "không" if it's the only word in a group and not the first group
  if (groups.length > 1) {
    for (let k = 0; k < groups.length - 1; k++) {
      if (groups[k] === '000' && words[k * 2] === 'không') { // Simplified check
        // This part needs more robust logic for complex cases, but for typical money amounts, it's often fine.
        // For now, we'll rely on the general cleanup.
      }
    }
  }

  // Capitalize first letter
  result = result.charAt(0).toUpperCase() + result.slice(1);

  // Add "âm" for negative numbers
  if (number < 0) {
    result = 'Âm ' + result;
  }

  return result + ' đồng';
};

export const generateQuoteHtml = (order, customer, user, store = null) => {
  const currentDate = new Date();
  const formattedDate = `lúc ${currentDate.getHours()}:${currentDate.getMinutes().toString().padStart(2, '0')} ${currentDate.getDate()} tháng ${currentDate.getMonth() + 1}, ${currentDate.getFullYear()}`;
  const topDate = `${currentDate.getHours()}:${currentDate.getMinutes().toString().padStart(2, '0')} ${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear().toString().slice(-2)}`;

  // Calculate totals
  const totalProductPrice = order.totalPrice || 0;
  const totalLicensePlateFee = order.totalLicensePlateFee || 0;
  const totalRegistrationFee = order.totalRegistrationFee || 0;
  const totalPromotion = order.totalPromotionAmount || 0;
  const totalPayment = order.totalPayment || 0;
  const fees = totalLicensePlateFee + totalRegistrationFee;

  const amountInWords = readMoney(totalPayment);

  const staffName = user?.fullName || 'Ngô Hoàng Trường Đẹt';
  // Use store info from store object if available, otherwise fallback to user or order
  const storeName = store?.storeName || order?.storeName || user?.storeName || 'Electra Gò Vấp';
  const storeAddress = store?.address || '65 đường Điện Biên Phủ, Phường 6, Quận Gò Vấp, Thành phố Hồ Chí Minh';
  const storePhone = order?.store?.phone || order?.store?.phone || store?.phone || '0908111234';

  const html = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Báo Giá - ${order.orderCode || 'ORD...'}</title>
      <style>
        @page {
          size: A4;
          margin: 0; /* Hide browser headers/footers */
        }
        body {
          font-family: 'Times New Roman', Times, serif;
          line-height: 1.3;
          color: #000;
          max-width: 210mm;
          margin: 0 auto;
          padding: 10mm 15mm; /* Add padding to body instead of page margin */
          background: white;
        }
        .top-bar {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          margin-bottom: 10px;
        }
        .header {
          text-align: center;
          margin-bottom: 15px;
        }
        .company-name {
          font-size: 20px;
          font-weight: bold;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .store-name {
          font-weight: bold;
          margin-bottom: 4px;
          font-size: 14px;
        }
        .address, .phone {
          font-size: 13px;
        }
        .divider {
          border-top: 2px solid #000;
          margin: 15px 0;
        }
        .order-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
          font-size: 13px;
        }
        .section-title {
          font-weight: bold;
          text-transform: uppercase;
          margin-bottom: 8px;
          font-size: 14px;
        }
        .customer-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
          font-size: 13px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
          font-size: 12px;
        }
        th, td {
          border: 1px solid #000;
          padding: 6px 4px;
          text-align: center;
        }
        th {
          font-weight: bold;
          background-color: #f9f9f9;
        }
        .text-left { text-align: left; }
        .text-right { text-align: right; }
        
        .summary-section {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 20px;
          page-break-inside: avoid;
        }
        .summary-table {
          width: 100%;
          max-width: 450px;
          border: 2px solid #000;
          font-size: 13px;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 4px 10px;
        }
        .summary-total {
          border-top: 1px solid #000;
          font-weight: bold;
          font-size: 15px;
          padding-top: 8px;
          margin-top: 4px;
        }
        .amount-words {
          margin-top: 8px;
          font-style: italic;
          font-size: 13px;
          padding: 0 10px 8px 10px;
        }
        
        .signatures {
          display: flex;
          justify-content: space-between;
          margin-top: 30px;
          text-align: center;
          page-break-inside: avoid;
        }
        .signature-box {
          width: 40%;
        }
        .signature-title {
          font-weight: bold;
          text-transform: uppercase;
          margin-bottom: 60px;
          font-size: 13px;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 11px;
          font-style: italic;
          border-top: 1px solid #ccc;
          padding-top: 8px;
        }
        
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">ELECTRA VIETNAM</div>
        <div class="store-name">CỬA HÀNG XE ĐIỆN ELECTRA</div>
        <div>${storeName}</div>
        <div class="address">Địa chỉ: ${storeAddress}</div>
        <div class="phone">Điện thoại: ${storePhone}</div>
      </div>

      <div class="divider"></div>

      <div class="order-info">
        <div>
          <div class="section-title">ĐƠN HÀNG</div>
          <div>Mã đơn hàng: ${order.orderCode || '---'}</div>
          <div>Ngày tạo: ${formattedDate}</div>
        </div>
        <div class="text-right">
          <div class="section-title">THÔNG TIN NHÂN VIÊN</div>
          <div>Nhân viên: ${staffName}</div>
          <div>Cửa hàng: ${storeName}</div>
        </div>
      </div>

      <div class="section-title">THÔNG TIN KHÁCH HÀNG</div>
      <div class="customer-info">
        <div>Họ và tên: ${customer?.fullName || ''}</div>
        <div>Số điện thoại: ${customer?.phone || ''}</div>
      </div>

      <div class="section-title">CHI TIẾT BÁO GIÁ</div>
      <table>
        <thead>
          <tr>
            <th style="width: 40px">STT</th>
            <th>Sản phẩm</th>
            <th>Màu sắc</th>
            <th style="width: 60px">Số lượng</th>
            <th>Đơn giá</th>
            <th>Phí đăng ký</th>
            <th>Phí biển số</th>
            <th>Khuyến mãi</th>
            <th>Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${order.getOrderDetailsResponses?.map((item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td class="text-left">
                ${item.modelName}
                <div style="font-size: 11px; color: #666; margin-top: 2px">
                  ${item.promotionName ? `KM: ${item.promotionName}` : ''}
                </div>
              </td>
              <td>${item.colorName}</td>
              <td>${item.quantity}</td>
              <td class="text-right">${formatCurrency(item.unitPrice)}</td>
              <td class="text-right">${formatCurrency(item.registrationFee)}</td>
              <td class="text-right">${formatCurrency(item.licensePlateFee)}</td>
              <td class="text-right">${item.discountAmount > 0 ? '-' + formatCurrency(item.discountAmount) : '-'}</td>
              <td class="text-right font-bold">${formatCurrency(item.totalPrice)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="summary-section">
        <div class="summary-table">
          <div class="summary-row">
            <span>Tổng giá sản phẩm:</span>
            <span>${formatCurrency(totalProductPrice)}</span>
          </div>
          <div class="summary-row">
            <span>Phí đăng ký + biển số:</span>
            <span>+${formatCurrency(fees)}</span>
          </div>
          <div class="summary-row">
            <span>Khuyến mãi:</span>
            <span>-${formatCurrency(totalPromotion)}</span>
          </div>
          <div class="summary-row summary-total">
            <span>TỔNG THANH TOÁN:</span>
            <span>${formatCurrency(totalPayment)}</span>
          </div>
          <div class="amount-words">
            Bằng chữ: <span>${amountInWords}</span>
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <div class="signatures">
        <div class="signature-box">
          <div class="signature-title">KHÁCH HÀNG</div>
          <div style="margin-top: 60px">(Ký, ghi rõ họ tên)</div>
        </div>
        <div class="signature-box">
          <div class="signature-title">NHÂN VIÊN BÁN HÀNG</div>
          <div style="margin-top: 60px">${staffName}</div>
        </div>
      </div>

      <div class="footer">
        Lưu ý: Vui lòng kiểm tra kỹ thông tin trước khi ký xác nhận.
      </div>

      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;

  return html;
};
