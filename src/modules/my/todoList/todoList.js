import { LightningElement, api, wire } from 'lwc';
import todoListAdapter from './todoListAdapter';

export default class TodoList extends LightningElement {
    records = [];
    @api origin;

    @wire(todoListAdapter)
    handleResponse(data){
        if(data){
            this.records = data.records.records
        } else {
            this.dispatchEvent(new CustomEvent('login'));
        }
    }
    
    /*
    connectedCallback() {
        fetch('/services/data/v54.0/ui-api/list-ui/Todo__c/All')
            .then((res) => {
                res.json().then((data) => (this.records = data.records.records));
            })
            .catch((e) => {
                this.dispatchEvent(new CustomEvent('login'));
                console.error(e);
            });
    }*/

    addTask(){
        // TODO
    }

    removeTask(event){
        // TODO
    }
}