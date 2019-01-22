const { EventEmitter } = require('events');

class Queue extends EventEmitter {
  constructor(total) {
    if (!new.target) {
      return new Queue();
    }
    super();
    this.tasks = [];
    this.concurrency = 11;
    this.running = 0;
    this.limited = false;
    if (total !== undefined) {
      this.totaltasks = total;
      this.completed = 0;
      this.limited = true;
    }
  }

  push(task) {
    if (this.running < this.concurrency) {
      this.running += 1;
      task();
      return;
    }
    this.tasks.push(task);
  }

  next() {
    this.completed += 1;
    this.running -= 1;
    if (this.limited && this.completed === this.totaltasks) {
      this.emit('completed');
    }
    if (this.tasks.length !== 0 && this.running < this.concurrency) {
      this.running += 1;
      this.tasks[0]();
      this.tasks.splice(0, 1);
    }
  }
}

module.exports = { Queue };
