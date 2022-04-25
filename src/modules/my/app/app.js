import { LightningElement } from 'lwc';

export default class HelloWorldApp extends LightningElement {
    isLoggedIn = true;

    handleLogin(){
        this.isLoggedIn = false;
    }
}
