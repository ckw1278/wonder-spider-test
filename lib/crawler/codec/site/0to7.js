'use strict';

const cheerio = require('cheerio');
const requestHelper = require('../../../requester/request-helper');
const Codec = require('../codec');

class Zerotoseven extends Codec {

  init() {
    this.eventDetailUri = '/sps/event/detail?eventId=';
    this.brandId = this.getBrandId();
    this.eventUri = this.origin + this.eventPath();
    if(this.brandId === '500131') this.decodeEvents = this.goongDecodeEvents;
  }

  eventPath() {
    return '/dms/corner/brand/event/list';
  }

  eventSectionPatterns() {
    return [
      /<li>((.|\n)*?)<\/li>/gm
    ];
  }

  eventUriPatterns() {
    return [
      /<a\shref="javascript:brand.template.goEventDetail\('event',\s'([0-9]+)',\s'.*?'\);">((.|\n)*?)<\/a>/gm
    ];
  }

  async decodeEvents() {
    let doc = await this._openDocument(this.uri);
    const $ = cheerio.load(doc, {decodeEntities: false});
    const body = {templateTypeCd: $('#hid_templateType').val(), brandId: this.brandId};
    let eventDoc = await requestHelper.post(this.eventUri, body);
    const $event = cheerio.load(eventDoc, {decodeEntities: false});
    const eventSection = $event('.brand_event_list').html();
    const events = [];
    let res;

    for(let ptrn of this.eventSectionPatterns()) {
      while((res = ptrn.exec(eventSection))) {
        const uriRes = /<a\shref="javascript:brand.template.goEventDetail\('event',\s'([0-9]+)',\s'.*?'\);">((.|\n)*?)<\/a>/gm.exec(res[1]);
        const statusRes = /<span\sclass=["']icon_type4\scol1["'].*?>(.*?)<\/span>/g.exec(uriRes[2]);

        if(statusRes && statusRes[1] === '진행중') {
          const imageRes = /<img.*?src=["'](.*?)["']/g.exec(uriRes[2]);
          const periodRes = /<span>응모기간\s:\s(.*?)<\/span>/g.exec(res[1]);
          const dates = periodRes[1].split('~');
          const start = dates[0].trim();
          const end = dates[1].trim();
          const start_at = new Date(start).getTime() / 1000;
          let endDate = new Date(end);

          endDate.setDate(endDate.getDate() + 1);

          const end_at = endDate.getTime() / 1000;

          events.push({event_uri: this.origin + this.eventDetailUri + uriRes[1], image: {url: imageRes[1]}, start_at: start_at, end_at: end_at});
        }
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
    const ptrn = /<meta.*property=["']og:title["'].*content=["'](.*?)["'].*?>/gm;
    let res = ptrn.exec(doc);

    if(!res || !res[1]) return;

    const title = res[1].trim();

    if(title && title.length) event.title = title;
  }

  descriptionMeta(doc, event) {
    const ptrn = /<meta.*property=["']og:description["'].*content=["'](.*)["']/gm;
    let res = ptrn.exec(doc);

    if(!res || !res[1]) return;

    const description = res[1].trim();

    if(description && description.length) event.description = description;
  }

  getBrandId() {
    const res = /.*?\?brandId=([0-9]+)/g.exec(this.uri);

    return res && res[1];
  }

  async goongDecodeEvents() {
    const doc = await requestHelper.get(this.origin + '/dms/goong/promotion/list', {brandId: this.brandId});
    const $ = cheerio.load(doc, {decodeEntities: false});
    const eventSection = $('.brand_event_list').html();
    const eventPtrn = /<a\shref="javascript:ccs.link.go\('\/sps\/event\/detail\?eventId=([0-9]+)'\);">((.|\n)*?)<\/a>/gm;
    const events = [];
    let res;

    while((res = eventPtrn.exec(eventSection))) {
      const imageRes = /<img.*?src=["'](.*?)["']/g.exec(res[2]);

      events.push({event_uri: this.origin + this.eventDetailUri + res[1], event_id: res[1], image: {url: imageRes[1]}});
    }

    return events;
  }
}

module.exports = Zerotoseven;
