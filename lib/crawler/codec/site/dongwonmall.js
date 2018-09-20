'use strict';

const cheerio = require('cheerio');
const Codec = require('../codec');

class Dongwonmall extends Codec {

  init() {

  }

  eventPath() {
    return '/event/eventList.do?E_GBN_CD=03';
  }

  eventUriPatterns() {
    return [
      /<a.*?href="(\/display\/plan.do\?seq=[0-9]+)".*?>((.|\n)*?)<\/a>/gm,
      /<a.*?href="(\/event\/evtls\/photoList.do)".*?>((.|\n)*?)<\/a>/gm
    ];
  }

  eventScriptPattern() {
    return /<a.*?onclick="javascript:goEvent\('([0-9]+)',\s'([0-9]+)'\).*?>((.|\n)*?)<\/a>/gm;
  }

  imageUrlPattern() {
    return /<img.*?src=["'](.*?)["']/g;
  }

  async decodeEvents() {
    const doc = await this._openDocument(this.uri);
    const $ = cheerio.load(doc, {decodeEntities: false});
    const eventSection = $('.event_list_frame').html();
    const events = [];
    let res;

    for(let ptrn of this.eventUriPatterns()) {
      while((res = ptrn.exec(eventSection))) {
        const imgRes = /<img.*?src=["'](.*?)["']/g.exec(res[2]);
        const imageUrl = imgRes[1];

        events.push({event_uri: this.origin + res[1], image: {url: imageUrl}});
      }
    }

    const eventScriptPattern = this.eventScriptPattern();

    while((res = eventScriptPattern.exec(eventSection))) {
      const imgRes = /<img.*?src=["'](.*?)["']/g.exec(res[3]);
      const imageUrl = imgRes[1];

      events.push({event_uri: this.origin + this.getQuery(res[1], res[2]), image: {url: imageUrl}});
    }

    return events;
  }

  async eventMeta(event) {
    const doc = await this._openDocument(event.event_uri);
    const $ = cheerio.load(doc, {decodeEntities: false});

    this.titleMeta(doc, event);
    this.descriptionMeta(doc, event);
  }

  titleMeta(doc, event) {
    let ptrn = /<meta.*name=["']Title["'].*content=["'](.*?)["'].*?>/gm;
    let res = ptrn.exec(doc);

    if(!res || !res[1]) {
      ptrn = /<title>((.|\n)*?)<\/title>/gm;
      res = ptrn.exec(doc);
      if(!res || !res[1]) return;
    }

    let title = res[1].replace(/:|통합판촉|쇼핑기획전|동원몰/g, '').replace(/_|-|\s\s/g, ' ').trim();

    if(title && title.length) event.title = title;
  }

  descriptionMeta(doc, event) {
    const ptrn = /<meta.*name=["']Description["'].*content=["'](.*)["']/gm;
    let res = ptrn.exec(doc);

    if(!res || !res[1]) return;

    let description = res[1].trim();

    if(description && description.length) event.description = description;
  }

  getQuery(seq, cd){
    const params = 'E_SEQ=' + seq + '&ER_SEQ=&E_GBN_CD=' + cd;
    let qs = '';
    if(cd == "01"){
      qs = '/event/experienceForm.do?' + params;
    }else if(cd == "02"){
      qs = '/event/cultureForm.do?' + params;
    }else if(cd == "03"){
      qs = '/event/affiliatesForm.do?' + params;
    }
    return qs;
  }
}

module.exports = Dongwonmall;