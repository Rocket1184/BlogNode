'use strict';

function $(selector) {
    return document.querySelectorAll(selector)[0];
}

function $s(selector) {
    return document.querySelectorAll(selector);
}

/**
 * Index Article
 * 
 * @class Article
 */
class Article {
    /*
     * Creates an instance of Article.
     * 
     * @param {any} fileName
     * @param {any} title
     * @param {any} content
     * @param {any} footnote
     * @param {any} node HTML Element of this article
     * 
     * @memberOf Article
     */
    constructor(fileName, title, content, footnote) {
        this.node = document.createElement('li');
        this.node.classList.add('stack');
        this.node.innerHTML = [
            `<a href="/archive/${fileName}" class="title">${title}</a>`,
            `<pre class="content">${content}</pre>`,
            `<span class="footnote">${footnote}</span>`,
        ].join('');
        this.node.getElementsByClassName('title')[0].onclick = e => {
            e.preventDefault();
            showView();
            loadArticleContent(this.fileName);
        };
    }
}

/**
 * Sidebar/Sidebox list item
 * 
 * @class SideListItem
 */
class SideListItem {
    /**
     * Creates an instance of SideListItem.
     * 
     * @param {any} content
     * @param {any} href
     * @param {any} target
     * @param {any} node HTML element of this <li>
     * 
     * @memberOf SideListItem
     */
    constructor(content, href, target) {
        this.node = document.createElement('li');
        this.node.classList.add('side-li');
        this.node.innerHTML = [
            `<a href="${href}" target="${target}">${content}</a>`
        ].join('');
    }
}

/**
 * Hide article content and show article list.
 */
function showIndex() {
    slideDownHide($('#index-article-view'));
    setTimeout(() => slideUpShow($('#index-article-list')), 500);
    let header = $('#view-header');
    slideDownShow(header);
    header.setAttribute('id', 'index-header');
}

function showView() {
    slideDownHide($('#index-article-list'));
    setTimeout(() => slideUpShow($('#index-article-view')), 500);
    let header = $('#index-header');
    slideUpHide(header);
    setTimeout(() => header.classList.remove('hidden'), 500);
    header.setAttribute('id', 'view-header');
}

function bidingArticleEntry() {
    let ul = document.querySelectorAll('li.stack>a');
    [].forEach.call(ul, li => {
        let herf = li.getAttribute('href');
        let fileName = /\/([^\/]+?)$/.exec(herf)[1];
        li.onclick = e => {
            e.preventDefault();
            showView();
            loadArticleContent(fileName);
        };
    });
}

function refreshArticleList() {
    let ul = document.querySelector('#index-article-list').getElementsByTagName('ul')[0];

    function success(response) {
        ul.innerHTML = '';
        let resData = JSON.parse(response);
        let freg = document.createDocumentFragment();
        resData.forEach(value => {
            let el = new Article(
                value.fileName,
                value.title,
                value.content,
                (new Date(value.date)).toLocaleString('chinese', { hour12: false })
            );
            freg.appendChild(el.node);
        });
        ul.appendChild(freg);
        bidingArticleEntry();
    }

    function fail() {
        let newLine = document.createElement('li');
        newLine.innerText = `List Load Faild :-(`;
        ul.appendChild(newLine);
    }

    let request = new XMLHttpRequest(); // New XMLHttpRequest Object

    request.onreadystatechange = () => { // invoked when readyState changes
        if (request.readyState === 4) { // request succeed
            // response result:
            if (request.status === 200) {
                // succeed: update article
                return success(request.response);
            } else {
                // failed: show error code
                return fail();
            }
        }
    };

    // send request
    request.open('GET', '/api/archive-list');
    request.send();
}

function loadArticleContent(fileName, fromState) {
    function success(response) {
        if (!fromState) {
            history.pushState({
                    originTitle: fileName,
                    type: 'archive',
                    originPathName: window.location.pathname
                },
                fileName,
                `/archive/${fileName}`
            );
        }
        let data = JSON.parse(response);
        document.getElementById('index-article-title').innerText = data.title;
        document.getElementById('index-article-content').innerHTML = data.content;
    }

    function fail(response) {
        document.getElementById('index-article-title').innerText = 'Article Load Faild :-(';
        document.getElementById('index-article-content').innerText = response;
    }

    let request = new XMLHttpRequest();

    request.onreadystatechange = () => {
        if (request.readyState === 4) {
            if (request.status === 200) {
                return success(request.response);
            } else {
                return fail(request.response);
            }
        }
    };

    request.open('GET', `/archive/${fileName}`);
    request.setRequestHeader('pushState-Ajax', true);
    request.send();
}

function loadMusicRecord() {
    let ul = document.getElementById('index-music-record');

    function success(rawList) {
        rawList.forEach((value, index) => {
            if (index > 9) return;
            let el = new SideListItem(
                `${value.name} - ${value.artistName}`,
                `http://music.163.com/#/song?id=${value.id}`,
                `_blank`
            );
            el.node.setAttribute('title', el.node.innerText);
            ul.appendChild(el.node);
        });
    }

    function fail() {
        ul.innerText = 'Music Record Load Faild :-(';
    }

    let request = new XMLHttpRequest();

    request.onreadystatechange = () => {
        if (request.readyState === 4) {
            if (request.status === 200) {
                let rawList = JSON.parse(request.response);
                return success(rawList);
            } else {
                return fail();
            }
        }
    };

    request.open('GET', `/api/music-record`);
    request.send();
}

function slideDownHide(el) {
    el.classList.add('slideDownHide');
    setTimeout(() => {
        el.classList.remove('slideDownHide');
        el.classList.add('hidden');
    }, 500);
}

function slideUpHide(el) {
    el.classList.add('slideUpHide');
    setTimeout(() => {
        el.classList.remove('slideUpHide');
        el.classList.add('hidden');
    }, 500);
}

function slideDownShow(el) {
    el.classList.add('slideDownShow');
    el.classList.remove('hidden');
    setTimeout(() => {
        el.classList.remove('slideDownShow');
    }, 500);
}

function slideUpShow(el) {
    el.classList.add('slideUpShow');
    el.classList.remove('hidden');
    setTimeout(() => {
        el.classList.remove('slideUpShow');
    }, 500);
}

document.addEventListener('readystatechange', () => {
    if (document.readyState === 'interactive') {
        loadMusicRecord();
        let btnIndex = document.getElementById('view-gotoIndex');
        btnIndex.onclick = e => {
            e.preventDefault();
            btnIndex.blur();
            history.pushState({ originTitle: '', type: 'index', originPathName: window.location.pathname }, '', '/');
            showIndex();
            refreshArticleList();
        };
    }
});

window.addEventListener('popstate', e => {
    if (!e.state) {
        let pn = window.location.pathname;
        let archiveRegex = /\/archive\/(.+)/;
        if (pn === '/') {
            showIndex();
            refreshArticleList();
        } else if (archiveRegex.test(pn)) {
            showView();
            loadArticleContent(archiveRegex.exec(pn)[1]);
        }
    } else if (e.state.type === 'index') {
        showIndex();
        refreshArticleList();
    } else if (e.state.type === 'archive') {
        showView();
        loadArticleContent(e.state.originTitle, true);
    }
});