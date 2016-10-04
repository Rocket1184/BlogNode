'use strict';

const regexs = {
    header: /(\#+)(.+)\n/,
    quote: /\n\>([\u0000-\uFFFF]+?)\n{2}/,
    image: /\!\[(.+)\]\((.+)\)\n/,
    link: /\[(.+)\]\((.+)\)/,
    codeBlock: /```(\w+)\n([\u0000-\uFFFF]+)\n```/,
    codeInline: /`([\u0000-\uFFFF]+)`/
}

function Md2Html(str) {
    let quote;
    while (quote = regexs.quote.exec(str)) {
        str = str.replace(regexs.quote, `\n<quote>\n${quote[1]}\n</quote>\n`);
    }
    let header;
    while (header = regexs.header.exec(str)) {
        str = str.replace(regexs.header, `<h${header[1].length}>${header[2]}</h${header[1].length}>\n`);
    }
    let image;
    while(image = regexs.image.exec(str)) {
        str = str.replace(regexs.image, `<img alt="${image[1]}" src="${image[2]}"/>\n`)
    }
    let link;
    while(link = regexs.link.exec(str)) {
        str = str.replace(regexs.link, `<a href="${link[2]}">${link[1]}</a>`)
    }
    let codeBlock;
    while(codeBlock = regexs.codeBlock.exec(str)) {
        str = str.replace(regexs.codeBlock, `<pre class="code-block ${codeBlock[1]}">\n${codeBlock[2]}\n</pre>\n`);
    }
    let codeInline;
    while(codeInline = regexs.codeInline.exec(str)) {
        str = str.replace(regexs.codeInline, `<span class="code-inline">${codeInline[1]}</span>`)
    }
    return str;
}

module.exports = {
    toHtml: Md2Html
}