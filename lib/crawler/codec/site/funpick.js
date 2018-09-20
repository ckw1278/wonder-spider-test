'use strict';

const cheerio = require('cheerio');
const Codec = require('../codec');

class Funpick extends Codec {

  eventPath() {
    return '/Promotion';
  }

  eventUriPatterns() {
    return [
      /<a.*?href="(.*?)".*?>((.|\n)*?)<\/a>/gm
    ];
  }

  imageUrlPattern() {
    return /<img.*?src=["'](.*?)["'].*?>/g;
  }

  async decodeEvents() {
    const doc = await this._openDocument(this.uri);
    const $ = cheerio.load(doc, {decodeEntities: false});
    //const eventSection = $('div#middler_body table table td').html();
    const eventSection = $('div#middler_body a img.img_bottom_border').first();
    const events = [];

    let res;

    for(let ptrn of this.eventUriPatterns()) {
      while((res = ptrn.exec(eventSection))) {
        const imgRes = /<img.*?src=["'](.*?)["']/g.exec(res[2]);
        const imageUrl = encodeURI('http:' + imgRes[1]);

        events.push({event_uri: this.origin + res[1], image: {url: imageUrl}});
      }
    }

    return events;
  }

  async eventMeta(event) {
    const doc = await this._openDocument(event.event_uri);

    this.titleMeta(doc, event);
    this.descriptionMeta(doc, event);
    this.periodMeta(doc, event);
  }

  titleMeta(doc, event) {
    const ptrn = /<meta.*property=["']og:title["'].*content=["'](.*?)["'].*?>/gm;
    let res = ptrn.exec(doc);

    if(!res || !res[1]) return;

    let title = res[1].replace(/&amp;#39;|&amp;|#39;/g, '').replace(/\s\s\s|\s\s/g, ' ').trim();

    if(title && title.length) event.title = title;
  }

  descriptionMeta(doc, event) {
    const ptrn = /<meta.*property=["']og:description["'].*content=["'](.*)["']/gm;
    let res = ptrn.exec(doc);

    if(!res || !res[1]) return;

    let description = res[1].trim();

    if(description && description.length) event.description = description;
  }

  periodMeta(doc, event) {
    const ptrn = /<span\sclass="customer-article__header-period">(.*?)<\/span>/gm;
    let res = ptrn.exec(doc);

    if(!res || !res[1]) return;

    const dates = res[1].split(' ~ ');

    event.start_at = new Date(dates[0]).getTime() / 1000;
    event.end_at = new Date(dates[1]).getTime() / 1000;
  }
}

module.exports = Funpick;
