window.__nimbus = {};
window.__nimbus.plugins = {};
window.__nimbus.plugins.barcodeScanner = {
    beginCapture: (input, callback) => {
        callback({ type: 'code128', value: 'test' }, null);
    },
    resumeCapture: (callback) => {
        callback({ type: 'code128', value: 'test2' }, null);
    },
};

export default window;
