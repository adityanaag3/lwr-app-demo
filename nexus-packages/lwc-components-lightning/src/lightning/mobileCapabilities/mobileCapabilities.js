/*
 * Copyright 2019 salesforce.com, inc.
 * All Rights Reserved
 * Company Confidential
 */
import BarcodeScannerFactory from './barcodeScanner/barcodeScannerFactory';
const WINDOW_DOT_NIMBUS = window.__nimbus;

// TODO: There is currently one plugin.  When we add more plugins then
// we need to devise a method where plugins stashed in window.__nimbus.plugins
// need to be moved to another location so that window.__nimbus.plugins object
// can be emptied out.  For more information see:
// @W-7267263
// https://gus.lightning.force.com/lightning/r/ADM_Work__c/a07B00000080Wk4IAE/view

// Nimbus core code can be found at https://github.com/salesforce/nimbus

// https://github.com/salesforce/nimbus-plugin-barcode-scanner
export const getBarcodeScanner = BarcodeScannerFactory(WINDOW_DOT_NIMBUS);
