import { LightningElement, wire } from 'lwc';
import { getListUi } from 'lightning/uiListApi';

export default class TodoList extends LightningElement {
    records = [];

    @wire(getListUi, {
        objectApiName: 'Todo__c',
        listViewApiName: 'All',
    })
    getRecords({ error, data }) {
        if (data) {
            this.records = data.records.records;
        } else if (error) {
            if (error.status === 401) {
                this.dispatchEvent(new CustomEvent('login'));
            }
        }
    }

    addTask(){
        // TODO
    }

    removeTask(event){
        // TODO
    }
}