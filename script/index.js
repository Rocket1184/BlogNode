'use strict';

function Article(title, content, footnote) {
    this.node = document.createElement('li');
    this.node.classList.add('stack');
    this.node.innerHTML = [
        `<a href="/archive/${title}" class="title">${title}</a>`,
        `<pre class="content">${content}</pre>`,
        `<span class="footnote">${footnote}</span>`,
    ].join('');
    this.node.getElementsByClassName('title')[0].onclick = e => {
        e.preventDefault();
        loadArticleContent(title);
    }
}

function loadArticleList() {
    var ul = document.querySelector('#index-article-list').getElementsByTagName('ul')[0];

    function success(response) {
        var resData = JSON.parse(response);
        resData.forEach((value, index) => {
            var el = new Article(value.title, value.summary, value.ctime);
            ul.appendChild(el.node);
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

    function success(response) {
        if (!fromState) {
            history.pushState({
                originTitle: articleTitle,
                type: 'archive',
                originPathName: window.location.pathname
            },
                articleTitle,
                `/archive/${articleTitle}`
            );
        }
        document.getElementById('index-article-view').classList.remove('hidden');
        document.getElementById('index-article-list').classList.add('hidden');

        document.getElementById('index-article-title').innerText = articleTitle;
        document.getElementById('index-article-content').innerText = response;
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
    request.setRequestHeader('pushState-Ajax', true);
    request.send();
}

function loadMusicRecord() {
    var ul = document.getElementById('index-music-record');

    function success(rawList) {
        rawList.forEach((value, index) => {
            if (index > 9) return;
            var li = document.createElement('li');
            var a = document.createElement('a');
            a.innerText = `${value.name} - ${value.artistName}`;
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
                    var rawList = JSON.parse(request.response);
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

function showIndex() {
    document.getElementById('index-article-view').classList.add('hidden');
    document.getElementById('index-article-list').classList.remove('hidden');
}

window.onload = () => {
    console.log('Welcome to Rocka\'s Node Blog! ');
    loadArticleList();
    loadMusicRecord();
    document.getElementById('view-gotoIndex').onclick = () => {
        history.pushState({ originTitle: '', type: 'index', originPathName: window.location.pathname }, '', '/');
        showIndex();
    }
}

window.onpopstate = (e) => {
    if (!e.state) {
        var pn = window.location.pathname;
        var archiveRegex = /\/archive\/(.+)/
        if (pn === '/') {
            showIndex();
        } else if (archiveRegex.test(pn)) {
            loadArticleContent(archiveRegex.exec(pn)[1]);
        }
    }
    else if (e.state.type === 'index') {
        showIndex();
    } else if (e.state.type === 'archive') {
        loadArticleContent(e.state.originTitle, true);
    }
}