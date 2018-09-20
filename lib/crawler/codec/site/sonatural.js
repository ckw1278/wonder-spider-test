'use strict';

const cheerio = require('cheerio');
const Codec = require('../codec');

class Sonatural extends Codec {

  eventPath() {
    return '/FrontStore/iMakePage.phtml?iPageId=197';
  }

  eventUriPatterns() {
    return [];
  }

  imageUrlPattern() {
    return;
  }

  async decodeEvents() {
    const doc = await this._openDocument(this.uri);
    const $ = cheerio.load(doc, {decodeEntities: false});
    let eventSection = $('.monthly-issue .issue');
    const events = [];

    for(let i=0;i<$(eventSection).length;i++) {
      const badge = $(eventSection).eq(i).find('.issue-badge').html().trim();
      const href = $(eventSection).eq(i).find('.issue-image a').attr('href');

      if(badge === 'EVENT' && $(eventSection).eq(i).find('.issue-image a').attr('href')) {
        const src = $(eventSection).eq(i).find('.issue-image img').attr('src');
        const title = $(eventSection).eq(i).find('.issue-name b').html();
        let description = $(eventSection).eq(i).find('.issue-sub-name').html();

        description = description.replace('<br>', ' ');
        events.push({event_uri: this.origin + href, image: {url: this.origin + src}, title: title, description: description});
      }
    }

    return events;
  }

  async eventMeta(event) {
    return;
  }
}

module.exports = Sonatural;