'use strict';

const regexs = {
    header: /^(#+)(.+?)$/,
    strong: /\*\*(.+?)\*\*/,
    italic: /\*([^\*]+?)\*/,
    deleted: /\~\~(.+?)\~\~/,
    link: /([^\!])\[(.+?)\]\((.+?)\)/,
    code: /`(.+?)`/,
    image: /\!\[(.+?)?\]\((.+?)?\)/
};

const openStat = {
    none: 0,
    quote: 1,
    code: 2,
    numberedList: 3,
    unumberedList: 4,
};

const endMark = [
    '</p>',
    '</quote>',
    '</code>',
    '</nl>',
    '</ul>'
];

/**
 * only replace inline element from markdown to html
 * 
 * @param {string} str markdown string
 * @returns {string} html styled
 */
function handleInline(str) {
    let strong;
    while (strong = regexs.strong.exec(str)) {
        str = str.replace(regexs.strong, `<b>${strong[1]}</b>`);
    }
    let italic;
    while (italic = regexs.italic.exec(str)) {
        str = str.replace(regexs.italic, `<em>${italic[1]}</em>`);
    }
    let deleted;
    while (deleted = regexs.deleted.exec(str)) {
        str = str.replace(regexs.deleted, `<del>${deleted[1]}</del>`);
    }
    let link;
    while (link = regexs.link.exec(str)) {
        str = str.replace(regexs.link, `${link[1]}<a href="${link[3]}">${link[2]}</a>`);
    }
    let code;
    while (code = regexs.code.exec(str)) {
        str = str.replace(regexs.code, `<span class="code-inline">${code[1]}</span>`);
    }
    return str;
}

/**
 * convert markdown string to html
 * 
 * @param {string} str markdown string
 * @returns {string} html styled string
 */
function ToHtml(str) {
    let res = new Array();
    let lastIndex = 0;
    let stack = new Array();
    str += '\n';
    while ((lastIndex = str.indexOf('\n')) > -1) {
        let buf = str.substring(0, lastIndex);
        str = str.substring(lastIndex + 1, str.length);

        // handle inline elements using regular expressions
        if (buf.indexOf('```') < 0) {
            buf = handleInline(buf);
        }

        // TODO: refactor needed....
        // that's like rubbish
        if (stack.length && stack[stack.length - 1] === openStat.code && buf.slice(0, 3) !== '```') {
            res.push(buf + '\n');
        } else if (buf.length == 0 && stack.length) {
            if (stack[stack.length - 1] != openStat.code) {
                res.push(endMark[stack.pop()]);
            }
        } else if (buf[0] == '#' && stack[stack.length - 1] != openStat.code) {
            res.push(endMark[stack.pop()]);
            let header = regexs.header.exec(buf);
            let headerLv = header[1].length;
            buf = buf.replace(regexs.header, `<h${headerLv}>${header[2].trim()}</h${headerLv}>`);
            res.push(buf);
        } else if (buf[0] === '>') {
            res.push(endMark[stack.pop()]);
            stack.push(openStat.quote);
            res.push('<quote>' + buf.slice(1) + '\n');
        } else if (buf[0] == '!') {
            res.push(endMark[stack.pop()]);
            let image = regexs.image.exec(buf);
            buf = buf.replace(
                regexs.image,
                `<img src="${image[2]}" alt="${image[1]}" />
                <span class="img-comment">${image[1]}</span>`
            );
            res.push(buf);
        } else if (buf.slice(0, 3) === '```') {
            if (stack[stack.length - 1] == openStat.code) {
                res.push(endMark[stack.pop()]);
            } else {
                res.push(endMark[stack.pop()]);
                stack.push(openStat.code);
                res.push(`<code class="code-block code-${buf.slice(3)}">`);
            }
        } else if (stack.length == 0) {
            stack.push(openStat.none);
            res.push('<p>' + buf);
        } else {
            res.push(buf + '\n');
        }
        // TODO: support ul and nl
    }
    while (stack.length) res.push(endMark[stack.pop()]);
    return res.join('').replace(/\<p\>[\b\n]?\<\/p\>/g, '');
}

module.exports = {
    toHtml: ToHtml
};