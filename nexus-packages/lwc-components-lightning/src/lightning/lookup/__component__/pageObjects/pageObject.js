/* eslint-disable @lwc/lwc/no-async-operation */
/* eslint-disable no-await-in-loop */
/* eslint-disable @lwc/lwc/no-rest-parameter */
/* eslint-disable @lwc/lwc/no-async-await */

export class PageObject {
    async waitFor(callback) {
        let msToWait = [50, 100, 150, 200, 250, 500, 1000];
        let msToWaitNow;
        while ((msToWaitNow = msToWait.shift())) {
            await this.wait(msToWaitNow);
            if (callback()) {
                return true;
            }
        }
        return false;
    }

    async wait(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }
}
