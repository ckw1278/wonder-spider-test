'use strict';

const Codec = require('../codec');

class ElandMall extends Codec {

  eventPath() {
    return '?list_only_yn=Y&disp_ctg_no=&disp_mall_no=0000014&page_idx=';
  }

  eventUriPatterns() {
    return [
      /<a.*?banner_kind_cd:'11'.*?move_cont_no:'([0-9]+)'.*?>((.|\n)*?)<\/a>/gm
    ];
  }

  lastPagePatterns() {
    return /<a.*?href=["']javascript:\/\/["']\sclass=["']btn_paging_end["']\scurrent=["']["']\svalue=["'](.*?)["'].*?>/g;
  }

  pagesPatterns() {
    return /<a.*?value="([0-9]+).*?">/gm;
  }

  imageUrlPattern() {
    return /<img.*?src=["'](.*?)["'].*?>/g;
  }

  async decodeEvents() {
    let currentPage = 1;
    let lastPage = 1;
    const doc = await this._openDocument(this.uri + this.eventPath() + currentPage);

    //console.log(doc);

    const events = [];
    let res;

    for(let ptrn of this.eventUriPatterns()) {
      while((res = ptrn.exec(doc))) {
        const imgRes = /<img.*?src=["'](.*?)["']/g.exec(res[2]);
        const imageUrl = 'http:' + imgRes[1];

        events.push({event_uri: this.origin +'/shop/initPlanShop.action?disp_ctg_no='+ res[1], image: {url: imageUrl}});
      }
    }

    const lastPagePtrn = this.lastPagePatterns();
    const lastPageRes = lastPagePtrn.exec(doc);

    if(lastPageRes) {
      lastPage = lastPageRes[1];
    } else {
      let pagesRes;
      const pagesPtrn = this.pagesPatterns();

      while((pagesRes = pagesPtrn.exec(doc))) {
        lastPage = pagesRes[1];
      }
    }

    currentPage++;

    while(currentPage <= lastPage) {
      const nextDoc = await this._openDocument(this.uri + this.eventPath() + currentPage);

      let nextRes;

      for(let ptrn of this.eventUriPatterns()) {
        while((nextRes = ptrn.exec(nextDoc))) {
          const imgRes = /<img.*?src=["'](.*?)["']/g.exec(nextRes[2]);
          const imageUrl = 'http:' + imgRes[1];

          events.push({event_uri: this.origin +'/shop/initPlanShop.action?disp_ctg_no='+ nextRes[1], image: {url: imageUrl}});
        }
      }

      currentPage++;
    }

    return events;
  }

  async eventMeta(event) {
    const doc = await this._openDocument(event.event_uri);

    this.titleMeta(doc, event);
    this.descriptionMeta(doc, event);
  }

  titleMeta(doc, event) {
    const ptrn = /<meta.*name=["']title["'].*content=["'](.*?)["'].*?>/gm;
    let res = ptrn.exec(doc);

    if(!res || !res[1]) return;

    let title = res[1].split('-')[0].trim();

    if(title && title.length) event.title = title;
  }

  descriptionMeta(doc, event) {
    const ptrn = /<meta.*name=["']description["'].*content=["'](.*)["']/gm;
    let res = ptrn.exec(doc);

    if(!res || !res[1]) return;

    let description = res[1].trim();

    if(description && description.length) event.description = description;
  }
}

module.exports = ElandMall;
