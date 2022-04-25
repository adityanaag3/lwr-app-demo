export default class todoListAdapter {
    connected = false;

    constructor(dataCallback) {
        this.dataCallback = dataCallback;
    }

    connect() {
        this.connected = true;
        this.fetchList();
    }

    disconnect() {
        this.connected = false;
    }

    update() {
        this.fetchList();
    }

    async fetchList(){
        if (this.connected){
            try{
                const response = await fetch('/services/data/v54.0/ui-api/list-ui/Todo__c/All');
                const results = await response.json();
                this.dataCallback(Object.assign({}, results));
            } catch(e){
                this.dataCallback(null);
            }
        } else {
            this.dataCallback(null);
        }
    } 
}