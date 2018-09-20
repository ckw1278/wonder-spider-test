'use strict';

const Codec = require('../codec');

class Lghshop extends Codec {

  eventPath() {
    return '/event/index.jsp?status=1&page=1';
  }

  eventUriPatterns() {
    return [
      /<a.*?href=["'](planView.jsp\?seq=([0-9]+).*?)["'].*?>((.|\n)*?)<\/a>/gm
    ];
  }

  imageUrlPattern() {
    return /<img.*?src=["'](.*?)["']/g;
  }

  async decodeEvents() {
    const doc = await this._openDocument(this.eventUri);
    const events = [];
    let res;

    for(let ptrn of this.eventUriPatterns()) {
      while((res = ptrn.exec(doc))) {
        const imgRes = this.imageUrlPattern().exec(res[3]);
        const imageUrl = this.uri + imgRes[1];

        events.push({event_uri: this.uri + '/event/' + res[1], event_id: res[2], image: {url: imageUrl}});
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
    const ptrn = /selected>((.|\n)*?)<\/option>/gm;
    let res = ptrn.exec(doc);

    if(!res || !res[1]) return;

    let title = res[1].replace(/_/g, ' ').trim();

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

module.exports = Lghshop;