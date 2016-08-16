'use strict';

function loadArticleList() {
    var ul = document.getElementById('index-article-list');

    function success(response) {
        var resData = JSON.parse(response);
        resData.forEach((title) => {
            var newLine = document.createElement('li');
            newLine.innerHTML = `<a href="javascript:loadArticleContent('${title}');">${title}</a>`;
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

function loadArticleContent(articleTitle, fromState) {
    var bq = document.getElementById('index-article-content');

    function success(response) {
        if (!fromState) {
            history.pushState({ originTitle: articleTitle }, articleTitle, `/archive/${articleTitle}`);
        }
        bq.innerText = response;
    }

    function fail(code) {
        bq.innerText = 'Article Load Faild: Please Refresh Page And Try Again.';
        bq.innerText += `Error Code: ${code}`;
    }

    var request = new XMLHttpRequest();

    request.onreadystatechange = () => {
        if (request.readyState === 4) {
            if (request.status === 200) {
                return success(request.response);
            } else {
                return fail(request.status);
            }
        }
    }

    request.open('GET', `/archive/${articleTitle}`);
    request.send();
}

function loadMusicRecord() {
    var ul = document.getElementById('index-music-record');

    function success(rawList) {
        rawList.forEach((value, index) => {
            if (index > 9) return;
            var li = document.createElement('li');
            var a = document.createElement('a');
            a.innerText = `${value.name} - ${value.artists[0].name}`;
            a.setAttribute('href', `http://music.163.com/#/song?id=${value.id}`);
            a.setAttribute('target', '_blank');
            li.appendChild(a);
            ul.appendChild(li);
        });
    }

    function showError(message) {
        ul.innerText = message;
    }

    function fail(code) {
        ul.innerText = 'Music Record Load Faild: Please Refresh Page And Try Again.';
        ul.innerText += `Error Code: ${code}`;
    }

    var request = new XMLHttpRequest();

    request.onreadystatechange = () => {
        if (request.readyState === 4) {
            if (request.status === 200) {
                try {
                    var rawList = JSON.parse(request.response)['/api/user/detail/76980626'].listenedSongs;
                } catch (e) {
                    return showError(e.message);
                }
                return success(rawList);
            } else {
                return fail(request.status);
            }
        }
    }

    request.open('GET', `/api/music-record`);
    request.send();
}

window.onload = () => {
    console.log('Welcome to Rocka\'s Node Blog! ');
    loadArticleList();
    loadMusicRecord();
}

window.onpopstate = (e) => {
    if (e.state) {
        loadArticleContent(e.state.originTitle, true);
    }
}