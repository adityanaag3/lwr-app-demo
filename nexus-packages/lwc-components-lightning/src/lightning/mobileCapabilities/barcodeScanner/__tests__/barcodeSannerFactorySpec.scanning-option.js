import '../__mockData__/window.nimbus.barcodeScanner';
import { getBarcodeScanner } from 'lightning/mobileCapabilities';

let barcodeScanner;
describe('BarcodeScanner', () => {
    beforeEach(() => {
        barcodeScanner = getBarcodeScanner();
    });

    it('should return "true" for "isAvailable()" when barcode scanning is available', () => {
        expect(barcodeScanner.isAvailable()).toBe(true);
    });

    describe('when barcode scanner is available', () => {
        describe('no argument is passed to beginCapture', () => {
            it('should reject the promise', () => {
                return expect(barcodeScanner.beginCapture()).rejects.toBe(
                    'Argument is not an object.'
                );
            });
        });

        describe('the argument to beginCapture is an array', () => {
            it('should reject the promise', () => {
                return expect(barcodeScanner.beginCapture([])).rejects.toBe(
                    'Argument is not an object.'
                );
            });
        });

        describe('the argument to beginCapture is a random string', () => {
            it('should reject the promise', () => {
                return expect(
                    barcodeScanner.beginCapture('Garbage in, garbage out')
                ).rejects.toBe('Argument is not an object.');
            });
        });

        describe('the argument to beginCapture is an instance of Object without barcodeTypes property', () => {
            it('should reject the promise', () => {
                return expect(barcodeScanner.beginCapture({})).rejects.toBe(
                    'Argument must have an array property named barcodeTypes.'
                );
            });
        });

        describe('the argument to beginCapture is an instance of Object with barcodeTypes property but not an array', () => {
            it('should reject the promise', () => {
                return expect(
                    barcodeScanner.beginCapture({ barcodeTypes: 'foo bar' })
                ).rejects.toBe(
                    'Argument must have an array property named barcodeTypes.'
                );
            });
        });

        describe('the argument to beginCapture is an instance of Object with barcodeTypes array property but with invalid barcode type', () => {
            it('should reject the promise', () => {
                return expect(
                    barcodeScanner.beginCapture({
                        barcodeTypes: ['non-existent barcode type'],
                    })
                ).rejects.toBe('Invalid barcode type found in the argument.');
            });
        });
    });
});
