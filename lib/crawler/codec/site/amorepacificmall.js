'use strict';

const Codec = require('../codec');
const requestHelper = require('../../../requester/request-helper');

class AmorePacificMall extends Codec {

  eventPath() {
    return '/event/event_event_list_renew_ajax.do';
  }

  eventDetailPath() {
    return '/event/all/event_event_view.do?i_sEventcd=';
  }

  eventDefaultParams() {
    return {
      i_sFlagIng: "Y",
      i_iNowPageNo: 1,
      i_iPageSize: 100
    }
  }

  async decodeEvents() {
    const params = this.eventDefaultParams();
    const result = await requestHelper.get(this.eventUri, params);
    let list = result.object.event_List.list;
    let page = result.object.event_List.page;

    while(page.i_iNowPageNo < page.i_iEndPage) {
      params.i_iNowPageNo++;

      const nextResult = await requestHelper.get(this.eventUri, params);

      list = list.concat(nextResult.object.event_List.list);
      page = nextResult.object.event_List.page;
    }

    const events = [];

    for(const item of list) {
      const period = this.periodMeta(item.v_event_st_dt, item.v_event_en_dt);
      const event = {
        event_id: item.v_eventcd,
        event_uri: this.uri + this.eventDetailPath() + item.v_eventcd,
        image: {url: item.v_mobile_img_path},
        title: item.v_eventnm,
        start_at: period.start,
        end_at: period.end
      };

      events.push(event);
    }

    return events;
  }

  periodMeta(startDate, endDate) {
    const start = new Date(startDate.slice(0, 4) +'-'+ startDate.slice(4, 6) +'-'+ startDate.slice(6, 8) + ' 00:00:00').getTime() / 1000;
    const end = new Date(endDate.slice(0, 4) +'-'+ endDate.slice(4, 6) +'-'+ endDate.slice(6, 8) + ' 23:59:59').getTime() / 1000;

    return {start, end};
  }
}

module.exports = AmorePacificMall;