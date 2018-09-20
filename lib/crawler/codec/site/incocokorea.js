'use strict';

const cheerio = require('cheerio');
const Codec = require('../codec');

class Incoco extends Codec {

  init() {
    this.eventDetailUri = '/ievent/news_view?ievent_seq=';
  }
  eventPath() {
    return '/ievent/news_view?ievent_seq=';
  }

  eventUriPatterns() {
    return [
      /<a.*?href="#".*?ievent_seq=".*?\+\s([0-9]+);.*?>((.|\n)*?)<\/a>/gm
    ];
  }

  imageUrlPattern() {
    return /<img.*?src=["'](.*?)["'].*?>/g;
  }

  async decodeEvents() {
    const doc = await this._openDocument(this.uri);
    const $ = cheerio.load(doc, {decodeEntities: false});
    const eventSection = $('.list-event').html();
    const events = [];
    let res;

    for(let ptrn of this.eventUriPatterns()) {
      while((res = ptrn.exec(eventSection))) {
        const imgRes = /<img.*?src=["'](.*?)["']/g.exec(res[2]);
        const titleRes = /<em.*?class="stitle">(.*?)<\/em>/g.exec(res[2]);
        const periodRes = /<i.*?class="date">(.*?)<\/i>/g.exec(res[2]);
        const dates = periodRes[1].split('~');
        const start = dates[0].trim();
        const end = dates[1].trim();
        const start_at = new Date(start).getTime() / 1000;
        const end_at = new Date(end).getTime() / 1000;

        events.push({
          event_uri: this.origin + this.eventDetailUri + res[1],
          image: {url: this.origin + imgRes[1]},
          title: titleRes[1],
          start_at: start_at,
          end_at: end_at
        });
      }
    }

    let currentPage = 1;
    let lastPage = 1;
    const lastPageRes = /<a\shref="http:\/\/incocokorea.com\/ievent\/news\?page=([0-9]+)&amp;"\sclass="page-next2">/g.exec(doc);

    if(lastPageRes) lastPage = lastPageRes[1];

    while(currentPage < lastPage) {
      currentPage++;
      const nextDoc = await this._openDocument(this.uri + '?page=' + currentPage);
      const next$ = cheerio.load(nextDoc, {decodeEntities: false});
      const nextEventSection = next$('.list-event').html();
      let nextRes;

      for(let ptrn of this.eventUriPatterns()) {
        while((nextRes = ptrn.exec(nextEventSection))) {
          const imgRes = /<img.*?src=["'](.*?)["']/g.exec(nextRes[2]);
          const titleRes = /<em.*?class="stitle">(.*?)<\/em>/g.exec(nextRes[2]);
          const periodRes = /<i.*?class="date">(.*?)<\/i>/g.exec(nextRes[2]);
          const dates = periodRes[1].split('~');
          const start = dates[0].trim();
          const end = dates[1].trim();
          const start_at = new Date(start).getTime() / 1000;
          const end_at = new Date(end).getTime() / 1000;

          events.push({
            event_uri: this.origin + this.eventDetailUri + nextRes[1],
            image: {url: this.origin + imgRes[1]},
            title: titleRes[1],
            start_at: start_at,
            end_at: end_at
          });
        }
      }
    }

    return events;
  }

  async eventMeta(event) {
    const doc = await this._openDocument(event.event_uri);

    this.descriptionMeta(doc, event);
  }

  descriptionMeta(doc, event) {
    const ptrn = /<meta.*property=["']og:description["'].*content=["'](.*)["']/gm;
    let res = ptrn.exec(doc);

    if(!res || !res[1]) return;

    let description = res[1].trim();

    if(description && description.length) event.description = description;
  }
}

module.exports = Incoco;