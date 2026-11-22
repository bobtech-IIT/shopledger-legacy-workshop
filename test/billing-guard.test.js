var test = require('node:test');
var assert = require('node:assert/strict');
var reports = require('../lib/reports');

test('billing guard returns a read-only HSN and coupon calculation proof', function () {
  var db = {
    orders: [{
      id: 1004,
      date: '30/01/2022',
      customer: 'Kalyani Foods',
      coupon: 'SAVE10',
      items: [{ name: 'Groundnut Oil', price: 1120, qty: 2, hsn: '1508' }],
      subtotal: 2240,
      discount: 150,
      tax: 104.5,
      total: 2194.5
    }]
  };
  var before = JSON.stringify(db);
  var guard = reports.getBillingGuard(db, 1004);

  assert.equal(guard.matchesBilled, true);
  assert.deepStrictEqual(guard.billed, { subtotal: 2240, discount: 150, tax: 104.5, total: 2194.5 });
  assert.deepStrictEqual(guard.proof, [{
    name: 'Groundnut Oil', hsn: '1508', gstPercent: 5,
    gross: 2240, discount: 150, taxable: 2090, tax: 104.5, net: 2194.5
  }]);
  assert.equal(JSON.stringify(db), before);
});
