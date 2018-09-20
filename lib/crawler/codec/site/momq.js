'use strict';

const cheerio = require('cheerio');
const Codec = require('../codec');

class Momq extends Codec {

  eventPath() {
    return '/event/initExhibition.action';
  }

  eventUriPatterns() {
    return [
      /<a.*?href=["'](http:\/\/www.momq.co.kr\/shop\/trendItemInfo.action\?disp_ctg_no=([0-9]+).*?)["'].*?>((.|\n)*?)<\/a>/gm
    ];
  }

  imageUrlPattern() {
    return /<img.*?src=["'](.*?)["']/g;
  }

  sectionSelector() {
    return '.momq_exhibition';
  }

  async decodeEvents() {
    const doc = await this._openDocument(this.eventUri);
    const $ = cheerio.load(doc, {decodeEntities: false});
    const sectionSelector = this.sectionSelector();
    const events = [];
    let res;

    for(let ptrn of this.eventUriPatterns()) {
      while((res = ptrn.exec($(sectionSelector).html()))) {
        const imgRes = this.imageUrlPattern().exec(res[3]);
        const imageUrl = imgRes[1];

        events.push({event_uri: res[1], event_id: res[2], image: {url: imageUrl}});
      }
    }

    return events;
  }

  async eventMeta(event) {
    const doc = await this._openDocument(event.event_uri);

    this.titleMeta(doc, event);
    this.descriptionMeta(doc, event);
  }

  titleMeta(doc, event) {
    const ptrn = /<meta.*property=["']og:description["'].*content=["'](.*?)["'].*?>/gm;
    let res = ptrn.exec(doc);

    if(!res || !res[1]) return;

    let title = res[1].trim();

    if(title && title.length) event.title = title;
  }

  descriptionMeta(doc, event) {
    const ptrn = /<meta.*property=["']og:description["'].*content=["'](.*)["']/gm;
    let res = ptrn.exec(doc);

    if(!res || !res[1]) return;

    let description = res[1].trim();

    if(description && description.length) event.description = description;
  }
}

module.exports = Momq;