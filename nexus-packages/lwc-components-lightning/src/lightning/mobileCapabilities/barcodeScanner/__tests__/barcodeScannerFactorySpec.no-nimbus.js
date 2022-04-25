import { getBarcodeScanner } from 'lightning/mobileCapabilities';

describe('BarcodeScanner', () => {
    it('should not be available when barcode scanner was not injected by a native app.', () => {
        const barcodeScanner = getBarcodeScanner();
        expect(barcodeScanner.isAvailable()).toBe(false);
    });
});
