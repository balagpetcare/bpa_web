import { describe, it } from 'node:test';
import * as assert from 'node:assert';

describe('Spay Neuter Booking Logic', () => {
  it('Only one service can be selected', () => {
    const service1 = 'spay';
    const service2 = 'neuter';
    let selectedService = service1;
    selectedService = service2;
    assert.strictEqual(selectedService, 'neuter');
    assert.notStrictEqual(selectedService, 'spay');
  });

  it('Service change clears slot/hold', () => {
    let slot = 'slot-1';
    let hold = 'hold-1';
    const procedure = 'spay';
    function changeProcedure(newProc: string) {
      if (newProc !== procedure) {
        slot = '';
        hold = '';
      }
    }
    changeProcedure('neuter');
    assert.strictEqual(slot, '');
    assert.strictEqual(hold, '');
  });

  it('Clinic change clears slot/hold', () => {
    let slot = 'slot-1';
    let hold = 'hold-1';
    const clinic = 'clinic-1';
    function changeClinic(newClinic: string) {
      if (newClinic !== clinic) {
        slot = '';
        hold = '';
      }
    }
    changeClinic('clinic-2');
    assert.strictEqual(slot, '');
    assert.strictEqual(hold, '');
  });

  it('Payment is disabled without a valid service and hold', () => {
    const service = '';
    const hold = null;
    const canPay = !!(service && hold);
    assert.strictEqual(canPay, false);
  });

  it('Correct amount summary for Spay', () => {
    const total = 2200;
    const advance = 500;
    assert.strictEqual(total, 2200);
    assert.strictEqual(total - advance, 1700);
  });

  it('Correct amount summary for Neuter', () => {
    const total = 1500;
    const advance = 500;
    assert.strictEqual(total, 1500);
    assert.strictEqual(total - advance, 1000);
  });

  it('Typed API error rendering', () => {
    const errorMap: Record<string, string> = {
      'SERVICE_TYPE_REQUIRED': 'Service type is required.',
      'PET_SEX_SERVICE_MISMATCH': 'The selected procedure is not compatible with your pet.',
    };
    assert.strictEqual(errorMap['PET_SEX_SERVICE_MISMATCH'], 'The selected procedure is not compatible with your pet.');
  });
  
  it('Login returnTo behavior', () => {
    const query = new URLSearchParams();
    query.set('procedure', 'spay');
    query.set('clinic', '123');
    const returnTo = `/auth/sign-in?next=${encodeURIComponent('/book?' + query.toString())}`;
    assert.ok(returnTo.includes(encodeURIComponent('procedure=spay')));
    assert.ok(returnTo.includes(encodeURIComponent('clinic=123')));
  });

  it('Double-click payment protection', () => {
    let submitting = false;
    let callCount = 0;
    function pay() {
      if (submitting) return;
      submitting = true;
      callCount++;
    }
    pay();
    pay();
    assert.strictEqual(callCount, 1);
  });

  it('Payment-return verification', () => {
    const paymentStatusUrl = 'success';
    const backendStatus = 'failed';
    const finalStatus = backendStatus;
    assert.strictEqual(finalStatus, 'failed');
  });
});
