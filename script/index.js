'use strict';

window.onload = () => {
    console.log('Welcome to Rocka\'s Node Blog! ');

    var ul = document.getElementsByTagName('ul')[0];

    function success(response) {
        var resData = JSON.parse(response);
        resData.forEach((title) => {
            var newLine = document.createElement('li');
            newLine.innerHTML = `<a href="javascript:void(0);">${title}</a>`;
            ul.appendChild(newLine);
        });
    }

    function fail(code) {
        var newLine = document.createElement('li');
        newLine.innerText = `List Load Faild: Please Refresh Page And Try Again.`;
        ul.appendChild(newLine);
    }

    var request = new XMLHttpRequest(); // New XMLHttpRequest Object

    request.onreadystatechange = () => { // invoked when readyState changes
        if (request.readyState === 4) { // request succeed
            // response result:
            if (request.status === 200) {
                // succeed: update article
                console.log(request.response);
                return success(request.response);
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