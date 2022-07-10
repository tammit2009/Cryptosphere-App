// Buffer but with functionality of queue (if required)

class BufferQueue {  

    constructor() {
        this.items = [];
    }

    enqueue(item) {
        this.items.push(item);
    }

    dequeue() {
        // removes the first item on the array
        return this.items.shift(); 
    }

    peek() {
        return this.items[0];
    }

    getSize() {
        return this.items.length;
    }

    isEmpty() {
        return this.getSize() === 0;
    }

    getItems() {
        return this.items;
    }
}

module.exports = BufferQueue;