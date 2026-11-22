var test = require('node:test');
var assert = require('node:assert/strict');
var invoice = require('../lib/invoice');
var pricing = require('../lib/pricing');

function figures(order) {
  return {
    invoice: invoice.computeInvoiceFigures(order),
    checkout: pricing.computeTotals(order.items, order.coupon)
  };
}

test('CURRENT BEHAVIOUR: invoice uses supplied 5% and 12% GST rates without a coupon', function () {
  var result = figures({
    id: 1001,
    coupon: '',
    items: [
      { name: 'Rice', price: 640, qty: 1, hsn: '1006', gstRate: 5 },
      { name: 'Ghee', price: 450, qty: 1, hsn: '0405', gstRate: 12 }
    ]
  });

  assert.deepStrictEqual(result.invoice, {
    subtotal: 1090, discount: 0, tax: 86, cgst: 43, sgst: 43, total: 1176,
    rows: [
      { name: 'Rice', sku: '-', hsn: '1006', qty: 1, price: 640, gstPercent: 5, line: 640, lineTax: 32 },
      { name: 'Ghee', sku: '-', hsn: '0405', qty: 1, price: 450, gstPercent: 12, line: 450, lineTax: 54 }
    ]
  });
  assert.deepStrictEqual(
    { tax: result.checkout.tax, total: result.checkout.total },
    { tax: 86, total: 1176 }
  );
});

test('CURRENT BEHAVIOUR: SAVE10 invoice uses the pre-tax checkout discount for order 1002', function () {
  var result = figures({
    id: 1002,
    coupon: 'SAVE10',
    items: [
      { name: 'Rice', price: 640, qty: 1, hsn: '1006', gstRate: 5 },
      { name: 'Sunflower Oil', price: 190, qty: 2, hsn: '1512', gstRate: 5 }
    ]
  });

  assert.deepStrictEqual(
    { subtotal: result.invoice.subtotal, discount: result.invoice.discount, tax: result.invoice.tax, total: result.invoice.total },
    { subtotal: 1020, discount: 102, tax: 45.9, total: 963.9 }
  );
  assert.deepStrictEqual(
    { discount: result.checkout.discount, tax: result.checkout.tax, total: result.checkout.total },
    { discount: 102, tax: 45.9, total: 963.9 }
  );
});

test('CURRENT BEHAVIOUR: SAVE10 invoice applies the 150-rupee checkout cap for order 1004', function () {
  var result = figures({
    id: 1004,
    coupon: 'SAVE10',
    items: [
      { name: 'Groundnut Oil', price: 1120, qty: 2, hsn: '1508', gstRate: 5 }
    ]
  });

  assert.deepStrictEqual(
    { subtotal: result.invoice.subtotal, discount: result.invoice.discount, tax: result.invoice.tax, total: result.invoice.total },
    { subtotal: 2240, discount: 150, tax: 104.5, total: 2194.5 }
  );
  assert.deepStrictEqual(
    { discount: result.checkout.discount, tax: result.checkout.tax, total: result.checkout.total },
    { discount: 150, tax: 104.5, total: 2194.5 }
  );
});

test('CURRENT BEHAVIOUR: all-18-percent order 1008 matches checkout without a coupon', function () {
  var result = figures({
    id: 1008,
    coupon: '',
    items: [
      { name: 'Chai', price: 140, qty: 1, hsn: '0902', gstRate: 18 },
      { name: 'Kokum Sherbet', price: 180, qty: 2, hsn: '2106', gstRate: 18 }
    ]
  });

  assert.deepStrictEqual(
    { subtotal: result.invoice.subtotal, discount: result.invoice.discount, tax: result.invoice.tax, cgst: result.invoice.cgst, sgst: result.invoice.sgst, total: result.invoice.total },
    { subtotal: 500, discount: 0, tax: 90, cgst: 45, sgst: 45, total: 590 }
  );
  assert.deepStrictEqual(
    { tax: result.checkout.tax, total: result.checkout.total },
    { tax: 90, total: 590 }
  );
});

test('CORRECT BEHAVIOUR: invoice matches checkout totals and HSN GST slabs for billed orders', function () {
  var orders = [
    {
      coupon: '', expectedRates: [5, 12],
      items: [
        { name: 'Rice', price: 640, qty: 1, hsn: '1006' },
        { name: 'Ghee', price: 450, qty: 1, hsn: '0405' }
      ]
    },
    {
      coupon: 'SAVE10', expectedRates: [5, 5],
      items: [
        { name: 'Rice', price: 640, qty: 1, hsn: '1006' },
        { name: 'Sunflower Oil', price: 190, qty: 2, hsn: '1512' }
      ]
    },
    {
      coupon: 'SAVE10', expectedRates: [5],
      items: [{ name: 'Groundnut Oil', price: 1120, qty: 2, hsn: '1508' }]
    },
    {
      coupon: '', expectedRates: [18, 18],
      items: [
        { name: 'Chai', price: 140, qty: 1, hsn: '0902' },
        { name: 'Kokum Sherbet', price: 180, qty: 2, hsn: '2106' }
      ]
    }
  ];

  orders.forEach(function (order) {
    var calculatedInvoice = invoice.computeInvoiceFigures(order);
    var checkout = pricing.computeTotals(order.items, order.coupon);

    assert.deepStrictEqual(
      {
        subtotal: calculatedInvoice.subtotal,
        discount: calculatedInvoice.discount,
        tax: calculatedInvoice.tax,
        cgst: calculatedInvoice.cgst,
        sgst: calculatedInvoice.sgst,
        total: calculatedInvoice.total
      },
      {
        subtotal: checkout.subtotal,
        discount: checkout.discount,
        tax: checkout.tax,
        cgst: checkout.cgst,
        sgst: checkout.sgst,
        total: checkout.total
      }
    );
    assert.deepStrictEqual(calculatedInvoice.rows.map(function (row) {
      return row.gstPercent;
    }), order.expectedRates);
  });
});
