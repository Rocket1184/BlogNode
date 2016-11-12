'use strict';

function $(selector) {
    return document.querySelectorAll(selector)[0];
}

function $s(selector) {
    return document.querySelectorAll(selector);
}

function getLink() {
    let port = '';
    if (location.port !== '') port = ':' + location.port;
    return location.protocol + '//' + location.hostname + port + location.pathname;
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
            hideIndexHeaderList();
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
 * scroll to top smoothly
 * 
 * @param {any} ms time/ms, empty for 500ms
 */
function ScrollTop(ms) {
    ms = ms || 500;
    let length = pageYOffset;
    let step = length * 1000 / ms / 60 + 1;
    let inv = setInterval(() => {
        scroll(pageXOffset, pageYOffset - step);
    }, 15);
    setTimeout(() => {
        clearInterval(inv);
    }, ms);
}

/**
 * Hide article content and show index header.
 */
function refreshIndex() {
    scroll(0, 0);
    slideDownHide($('.main'));
    setTimeout(() => {
        $('#disqus_thread').classList.add('hidden');
        $('#index-article-view').classList.add('hidden');
        $('#index-article-list').classList.remove('hidden');
        refreshArticleList(() => slideUpShow($('.main')));
        loadDisqusComment('Rocka\'s Blog', 'Rocka\'s Blog Index');
    }, 500);
    let header = $('#view-header');
    if (header) {
        slideDownShow(header);
        header.setAttribute('id', 'index-header');
    }
}

/**
 * hide index header and article list
 */
function hideIndexHeaderList() {
    slideDownHide($('.main'));
    let header = $('#index-header');
    slideUpHide(header);
    setTimeout(() => {
        scroll(0, 0);
        $('#index-article-view').classList.remove('hidden');
        $('#index-article-list').classList.add('hidden');
        $('#disqus_thread').classList.remove('hidden');
        header.classList.remove('hidden');
        header.setAttribute('id', 'view-header');
    }, 500);
}

/**
 * biding pjax request to index article entry
 */
function bidingArticleEntry() {
    let ul = document.querySelectorAll('li.stack>a');
    [].forEach.call(ul, li => {
        let herf = li.getAttribute('href');
        let fileName = /\/([^\/]+?)$/.exec(herf)[1];
        li.onclick = e => {
            e.preventDefault();
            hideIndexHeaderList();
            loadArticleContent(fileName, false, () => {
                setTimeout(() => slideUpShow($('.main')), 500);
            });
        };
    });
}

/**
 * delete all index article entries and reload from server
 */
function refreshArticleList(callback) {
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
        newLine.classList.add('stack');
        ul.innerHTML = newLine.outerHTML;
    }

    let request = new XMLHttpRequest(); // New XMLHttpRequest Object

    request.onreadystatechange = () => { // invoked when readyState changes
        if (request.readyState === 4) { // request succeed
            // response result:
            if (request.status === 200) {
                // succeed: update article
                success(request.response);
            } else {
                // failed: show error code
                fail();
            }
            callback && callback();
        }
    };

    // send request
    request.open('GET', '/api/archive-list');
    request.send();
}

/**
 * (re)load Disqus comments
 * 
 * @param {any} id page identifier
 * @param {any} title page title
 */
function loadDisqusComment(id, title) {
    DISQUS.reset({
        reload: true,
        config: function() {
            this.page.url = getLink();
            this.page.title = title;
            this.page.identifier = id;
        }
    });
}

/**
 * load article content by article fileName
 * 
 * @param {any} fileName
 * @param {any} fromState is from window 'popstate' event
 * @param {any} callback callback(request.status) after xhr request finished
 */
function loadArticleContent(fileName, fromState, callback) {
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
        loadDisqusComment(fileName, data.title);
    }

    function fail(response) {
        document.getElementById('index-article-title').innerText = 'Article Load Faild :-(';
        document.getElementById('index-article-content').innerText = response;
    }

    let request = new XMLHttpRequest();

    request.onreadystatechange = () => {
        if (request.readyState === 4) {
            if (request.status === 200) {
                success(request.response);
            } else {
                fail(request.response);
            }
            callback && callback(request.status);
            return;
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
        ul.innerHTML = '<li class="side-li"><a>Music Record Load Faild :-(</a></liz>';
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
            refreshIndex();
        };
    }
});

window.addEventListener('popstate', e => {
    if (!e.state) {
        let pn = window.location.pathname;
        let archiveRegex = /\/archive\/(.+)/;
        if (pn === '/') {
            refreshIndex();
        } else if (archiveRegex.test(pn)) {
            hideIndexHeaderList();
            loadArticleContent(archiveRegex.exec(pn)[1]);
        }
    } else if (e.state.type === 'index') {
        refreshIndex();
    } else if (e.state.type === 'archive') {
        hideIndexHeaderList();
        loadArticleContent(e.state.originTitle, true, () => {
            setTimeout(() => slideUpShow($('.main')), 500);
        });
    }
});