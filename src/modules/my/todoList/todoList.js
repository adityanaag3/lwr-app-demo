import { LightningElement } from 'lwc';

export default class TodoList extends LightningElement {
    records = [];

    connectedCallback() {
        fetch('/api/getTodoItems')
            .then((res) => {
                res.json().then((data) => {
                    this.records = data.records;
                });
            })
            .catch((e) => {
                console.error(e);
            });
    }

    addTask(){
        // TODO
    }

    removeTask(event){
        // TODO
    }
}