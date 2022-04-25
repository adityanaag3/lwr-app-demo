/*
 * Copyright 2019 salesforce.com, inc.
 * All Rights Reserved
 * Company Confidential
 */
export default function BarcodeScannerFactory(nimbus) {
    let barcodeScanner;
    if (nimbus && nimbus.plugins.barcodeScanner) {
        barcodeScanner = nimbus.plugins.barcodeScanner;
        // TODO: When@W-7267263(https://gus.lightning.force.com/lightning/r/ADM_Work__c/a07B00000080Wk4IAE/view)
        // is done there will be a logic that should consolidate deletion of all plugins from
        // nimbus.plugins.  Then the following line can be removed.
        delete nimbus.plugins.barcodeScanner;
    }

    const BarcodeScanner = class BarcodeScannerWithCheck {
        // Following barcode types are supported by Android and iOS out of the box.
        // Create an array with types of barcode specified here as a parameter to
        // beginCapture method to restrict which types are to be scanned in a
        // capture session.
        get barcodeTypes() {
            return {
                CODE_128: 'code128',
                CODE_39: 'code39',
                CODE_93: 'code93',
                DATA_MATRIX: 'datamatrix',
                EAN_13: 'ean13',
                EAN_8: 'ean8',
                ITF: 'itf',
                UPC_E: 'upce',
                PDF_417: 'pdf417',
                QR: 'qr',
            };
        }
        isAvailable() {
            return barcodeScanner !== undefined;
        }

        beginCapture(options) {
            const barcodeValues = Object.values(this.barcodeTypes);
            return new Promise((resolve, reject) => {
                if (
                    !options ||
                    typeof options !== 'object' ||
                    options.constructor !== Object
                ) {
                    reject('Argument is not an object.');
                    return;
                }
                if (
                    options.barcodeTypes === 'undefined' ||
                    !Array.isArray(options.barcodeTypes)
                ) {
                    reject(
                        'Argument must have an array property named barcodeTypes.'
                    );
                    return;
                }
                if (options.barcodeTypes.length > 0) {
                    const validBarcodeTypes = options.barcodeTypes.every(
                        (barcodeType) => barcodeValues.indexOf(barcodeType) >= 0
                    );
                    if (!validBarcodeTypes) {
                        reject('Invalid barcode type found in the argument.');
                        return;
                    }
                }
                barcodeScanner.beginCapture(options, (result, error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                });
            });
        }
        resumeCapture() {
            return new Promise((resolve, reject) => {
                barcodeScanner.resumeCapture((result, error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                });
            });
        }
        endCapture() {
            barcodeScanner.endCapture();
        }
    };

    function factory() {
        return new BarcodeScanner();
    }

    return factory;
}
