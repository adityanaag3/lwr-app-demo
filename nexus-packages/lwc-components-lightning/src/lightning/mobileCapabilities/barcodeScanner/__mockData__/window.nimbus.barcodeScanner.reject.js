window.__nimbus = {};
window.__nimbus.plugins = {};
window.__nimbus.plugins.barcodeScanner = {
    beginCapture: (input, callback) => {
        callback(null, 'errorOnBeginCapture');
    },
    resumeCapture: (callback) => {
        callback(null, 'errorOnResumeCapture');
    },
};

export default window;
