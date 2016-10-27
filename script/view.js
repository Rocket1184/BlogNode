'use strict';

document.addEventListener('readystatechange', () => {
    if (document.readyState === 'interactive') {
        loadMusicRecord();
    }
});