'use strict';

const cheerio = require('cheerio');
const Codec = require('../codec');

class Cjonmart extends Codec {

  eventPath() {
    return '/mobile/event/planning/planningEvent.do';
  }

  eventPagePatterns() {
    return [
      /<a.*?href="(http:\/\/www.cjonmart.net\/event\/planning\/planningEventList.do?.*?)".*?>((.|\n)*?)<\/a>/gm
    ];
  }

  eventUriPatterns() {
    return [
      /<a.*?|\n.*?href="(\/event\/planning\/planningEventList.do?.*?)".*?>((.|\n)*?)<\/a>/gm
    ];
  }

  imageUrlPattern() {
    return /<img.*?src=["'](.*?)["']/g;
  }

  sectionSelector() {
    return '.J_event-list';
  }

  async decodeEvents() {
    const doc = await this._openDocument(this.uri);
    const $ = cheerio.load(doc, {decodeEntities: false});
    const eventPageSection = $('#npop_bann').html();
    const events = [];
    let res;

    for(let ptrn of this.eventPagePatterns()) {
      while((res = ptrn.exec(eventPageSection))) {
        const eventDoc = await this._openDocument(res[1]);
        const $event = cheerio.load(eventDoc, {decodeEntities: false});
        const eventSection = $event('#planningListRecomm').html();
        let eventRes;

        for(let ptrn of this.eventUriPatterns()) {
          while((eventRes = ptrn.exec(eventSection))) {
            const result = events.find((event) => {return event.event_uri === (this.origin + eventRes[1])});

            if(!result) {
              const imgRes = /<img.*?src=["'](.*?)["']/g.exec(eventRes[2]);

              events.push({event_uri: this.origin + eventRes[1], image: {url: this.origin + imgRes[1]}});
            }
          }
        }
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
    const ptrn = /<title>((.|\n)*?)<\/title>/gm;
    let res = ptrn.exec(doc);

    if(!res || !res[1]) return;

    let title = res[1].split('|')[0].trim();

    if(title && title.length) event.title = title;
  }

  descriptionMeta(doc, event) {
    const ptrn = /<meta.*name=["']Description["'].*content=["'](.*)["']/gm;
    let res = ptrn.exec(doc);

    if(!res || !res[1]) return;

    let description = res[1].split('|')[0].trim();

    if(description && description.length) event.description = description;
  }

  periodMeta(doc, event) {
    const $ = cheerio.load(doc, {decodeEntities: false});
    const headerSection = $('.contentHeader').html();
    let res = /<p>((.|\n)*?)<\/p>/gm.exec(headerSection);

    if(!res || !res[1]) return;

    let dates = res[1].replace(/\n|\t/g, '');

    dates = dates.replace('[기간]', '');
    dates = dates.split('~');
    event.start_at = new Date(dates[0]).getTime() / 1000;
    event.end_at = new Date(dates[1]).getTime() / 1000;
  }
}

module.exports = Cjonmart;