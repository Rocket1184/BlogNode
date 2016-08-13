'use strict';

window.onload = () => {
    console.log('Welcome to Rocka\'s Node Blog! ');
    
    var bq = document.createElement('blockquote');
    document.body.appendChild(bq);

    function success(text) {
        var bq = document.getElementById('test-response-text');
        bq.innerText = text;
    }

    function fail(code) {
        var bq = document.getElementById('test-response-text');
        bq.innerText = 'Error code: ' + code;
    }

    var request = new XMLHttpRequest(); // New XMLHttpRequest Object

    request.onreadystatechange =  () => { // invoked when readyState changes
        if (request.readyState === 4) { // request succeed
            // response result:
            if (request.status === 200) {
                // succeed: update article
                return success(request.responseText);
            } else {
                // failed: show error code
                return fail(request.status);
            }
        }
    }

    // send request
    request.open('GET', '/api/index-article-list');
    request.send();
}