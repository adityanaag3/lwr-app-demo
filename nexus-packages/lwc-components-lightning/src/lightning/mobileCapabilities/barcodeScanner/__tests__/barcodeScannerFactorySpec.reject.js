import '../__mockData__/window.nimbus.barcodeScanner.reject';
import { getBarcodeScanner } from 'lightning/mobileCapabilities';

let barcodeScanner;

describe('BarcodeScanner', () => {
    beforeEach(() => {
        barcodeScanner = getBarcodeScanner();
    });

    it('should return "true" for "isAvailable()" when barcode scanning is available', () => {
        expect(barcodeScanner.isAvailable()).toBe(true);
    });

    // Tests for API's to return promises are here primarily to preserve their method signatures and
    // not break the contract in the future versions.
    describe('when barcode scanner is available', () => {
        it('should begin capture and reject promise', () => {
            const input = {
                barcodeTypes: [barcodeScanner.barcodeTypes.CODE_128],
            };
            return expect(barcodeScanner.beginCapture(input)).rejects.toBe(
                'errorOnBeginCapture'
            );
        });
        it('should resume capture and reject promise', () => {
            return expect(barcodeScanner.resumeCapture()).rejects.toBe(
                'errorOnResumeCapture'
            );
        });
    });
});
