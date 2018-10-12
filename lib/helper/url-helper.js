'use strict';

const _ = require('underscore');
const urlHelper = module.exports;

urlHelper.getHostKeyFromUrl = (url) => {
  if(!url || !/^http/i.test(url)) {
    return null;
  }

  let hostkey = null;
  let hostname = urlHelper.getHostUrl(url);

  try {

    // remove m.
    hostname = hostname.replace(/(^|\/|\.)m(?=\.)/i, '');

    // exclude www
    hostname = hostname.replace(/(^|\/|\.)w+([0-9]+)?(?=\.)/i, '');

    // exclude country domains
    hostname = hostname.replace(/\.[a-z]{2}$/i, '');

    // exclude original domains & second-level domains
    hostname = hostname.replace(/\.(com|org|net|int|edu|gov|mil)$/i, '');

    // exclude country-sub-domain
    hostname = hostname.replace(/\.((c|g)o|(r|n|p)e|ac|or)$/i, '');

    // exclude MAKESHOP EXCEPTION campus, special, free
    hostname = hostname.replace(/((c|speci)a(l|mpus)|free)[0-9]+\.(?=freesell)/, '');

    // exclude solution free domain
    hostname = hostname.replace(/\.((caf|fre)e(24|sell)|mywisa|godo(mall)?)$/i, '');

    //elandmall domain remove
    const elandRes = /(.*?).elandmall/g.exec(hostname);

    if(elandRes) hostname = hostname.replace(elandRes[1], '');

    // exclude meaningless dot
    let remains = _.filter(hostname.split('.'), (v) => v);

    // done...
    if(remains.length > 0)
      hostkey = remains.join('.');

  } catch(e) {
    hostkey = null;
  }

  return hostkey;
};

urlHelper.getHostUrl = (url, withProtocol = false) => {
  if(!url || !/^http/i.test(url)) {
    return null;
  }

  let hosturl;

  try  {
    if(withProtocol) {
      hosturl = _.toArray(/https?:\/\/[^\/]+/.exec(url)).slice(-1).toString();
    } else {
      hosturl = _.toArray(/(https?:\/\/)?([^\/]+)/.exec(url)).slice(-1).toString();
    }
  } catch(e) {
    hosturl = null;
  }

  return hosturl;
};
