import { LightningElement } from 'lwc';

export default class App extends LightningElement {

    isLoggedIn = true;
    origin = 'https://agility-momentum-7499-dev-ed.cs73.my.salesforce.com';
    consumerKey = "3MVG9z6NAroNkeMkINYneakoGz6ZC2B44hEcL6LUi2XK7VGkLJa6sNVja3N3DOh6UUCvEAtUj6DPc8E.g.s16"
    redirectUri = "http://localhost:3000/"
    
    get loginHref(){
        return `${this.origin}/services/oauth2/authorize?client_id=${this.consumerKey}&redirect_uri=${encodeURIComponent(this.redirectUri)}&response_type=token`;
    }

    async connectedCallback() {
        // This page is acting as the User-Agent OAuth 'redirect_uri', which receives the AuthInfo
        // Look for AuthInfo in the URL hash
        const authInfo = {};
        const authParams = new URLSearchParams(window.location.hash.substring(1));
        authParams.forEach((value, key) => (authInfo[key] = value));

        if (authInfo.access_token && authInfo.instance_url) {
            // Put the AuthInfo in localStorage
            sessionStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(authInfo));
            // Remove the AuthInfo from the hash AND browser history
            // Note: This reloads the page
            const { origin, pathname, search } = window.location;
            window.location.replace(`${origin}${pathname}${search}`);
        }
    }

    handleLogin() {
        this.isLoggedIn = false;
    }
}
