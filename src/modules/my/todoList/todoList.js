import { LightningElement, api } from 'lwc';

export default class TodoList extends LightningElement {
    records = [];
    @api origin;

    connectedCallback() {
        const authInfo = JSON.parse(sessionStorage.getItem('auth'));
        if(authInfo){
            fetch(`${this.origin}/services/data/v54.0/ui-api/list-ui/Todo__c/All`, {
                headers: {
                    Authorization: 'Bearer ' + authInfo.access_token
                }
            })
                .then((res) => {
                    res.json().then((data) => (this.records = data.records.records));
                })
                .catch((e) => {
                    this.dispatchEvent(new CustomEvent('login'));
                    console.error(e);
                });
        } else {
            this.dispatchEvent(new CustomEvent('login'));
        }
    }

    addTask(){
        // TODO
    }

    removeTask(event){
        // TODO
    }
}