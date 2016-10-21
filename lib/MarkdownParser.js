'use strict';

const regexs = {
    header: /\n(\#+)(.+)\n|^(\#+)(.+)\n/,
    quote: /\n\>([\u0000-\uFFFF]+?)\n{2}/,
    image: /\n\!\[(.+?)\]\((.+?)\)\n/,
    link: /\[(.+?)\]\((.+?)\)/,
    codeBlock: /\n```(\w+)\n([\u0000-\uFFFF]+?)\n```/,
    codeInline: /`([\u0000-\uFFFF]+?)`/,
    paragraph: /\n\n([\u0000-\uFFFF]+?)\n\n/,
};

/**
 * convert markdown string to html string
 * 
 * @param {string} str markdown styled string
 * @returns html string
 */
function Md2Html(str) {
    let quote;
    while (quote = regexs.quote.exec(str)) {
        str = str.replace(regexs.quote, `<quote>${quote[1]}</quote>\n`);
    }
    let header;
    while (header = regexs.header.exec(str)) {
        let headerLv = header[1] ? header[1].length : header[3].length;
        str = str.replace(regexs.header, `<h${headerLv}>${header[2]||header[4]}</h${headerLv}>\n`);
    }
    let image;
    while(image = regexs.image.exec(str)) {
        str = str.replace(
            regexs.image, 
            `\n<img alt="${image[1]}" src="${image[2]}"/>
            <span class="img-comment">${image[1]}</span>\n`
        );
    }
    let link;
    while(link = regexs.link.exec(str)) {
        str = str.replace(regexs.link, `<a href="${link[2]}">${link[1]}</a>`);
    }
    let codeBlock;
    while(codeBlock = regexs.codeBlock.exec(str)) {
        str = str.replace(regexs.codeBlock, `\n<pre class="code-block ${codeBlock[1]}">\n${codeBlock[2]}\n</pre>`);
    }
    let codeInline;
    while(codeInline = regexs.codeInline.exec(str)) {
        str = str.replace(regexs.codeInline, `<span class="code-inline">${codeInline[1]}</span>`);
    }
    let paragraph;
    while(paragraph = regexs.paragraph.exec(str)) {
        str = str.replace(regexs.paragraph, `\n<p>${paragraph[1]}</p>\n`);
    }
    return str;
}

module.exports = {
    toHtml: Md2Html
};