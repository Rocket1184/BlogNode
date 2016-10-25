'use strict';

const fs = require('fs');

let regex = /(\d*)-(\d*)/;

/**
 * Stands for http range header
 * 
 * @class Ranger
 */
class Ranger {
    
    /**
     * Creates an instance of Ranger.
     * 
     * @param {string} range http range header
     * @param {Stats} stats fs.Stats of file
     * 
     * @memberOf Ranger
     */
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

    /**
     * Get http Content-Length header
     * 
     * @returns {number} Content-Length
     * 
     * @memberOf Ranger
     */
    size() {
        return Math.abs(this.end - this.start + 1);
    }
}

/**
 * Create ranger for file
 * 
 * @param {string} range html range header
 * @param {Stats} stats fs.Stats of file
 * @returns class Ranger or false
 */
function createRange(range, stats) {
    if (range.indexOf(',') >= 0) return false;
    return new Ranger(range, stats);
}

/**
 * Create Range Read Stream of specific file
 * 
 * @param {string} path full path to file
 * @param {Ranger} ranger ranger of file
 * @returns ReadStream
 */
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