'use strict';

const fs = require('fs');

let regex = /(\d*)-(\d*)/;

class Ranger {
    constructor(range, stats) {
        this.headerRange = range;
        try {
            let arr = regex.exec(range);
            this.start = parseInt(arr[1], 10);
            this.end = parseInt(arr[2], 10);
        } catch (err) {}
        if(isNaN(this.start)) {
            this.start = stats.size - this.end;
            this.end = stats.size - 1;
        } else if (isNaN(this.end)) {
            this.end = stats.size - 1;
        }
        if(this.size() > stats.size || this.end > stats.size - 1) throw new Error('Range cannot longer than file size.');
    }

    size() {
        return Math.abs(this.end - this.start + 1);
    }
}

function createRange(range, stats) {
    if (range.indexOf(',') >= 0) return false;
    return new Ranger(range, stats);
}

function stream(path, ranger) {
    if (ranger) {
        let st =  fs.createReadStream(path, ranger);
        st.ranger = ranger;
        return st;
    } else {
        throw new Error('Invalid Range.');
    }
}

module.exports = {
    createRange: createRange,
    stream: stream
};