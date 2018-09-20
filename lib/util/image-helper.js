'use strict';

const imageHelper = module.exports;

imageHelper.setRatio = (image) => {
  if(!image || !image.width || !image.height) return;

  image.ratio = Math.round(image.height / image.width * 10000) / 10000;
};
