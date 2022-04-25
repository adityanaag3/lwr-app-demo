import { LightningElement } from 'lwc';

export default class TodoList extends LightningElement {
    records = [
        {
            id:1,
            name: 'First Static Task'
        },
        {
            id:2,
            name: 'Second Static Task'
        },
    ];

    addTask(){
        // TODO
    }

    removeTask(event){
        // TODO
    }
}