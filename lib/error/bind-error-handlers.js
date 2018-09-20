'use strict';

const ReplyableError = require('./replyable-error');
const CustomError = require('./custom/custom-error');

function reply(res, error, defaultReplyFormat) {
  res.status(error.code);

  const replyFormat = error.replyFormat || defaultReplyFormat;

  // 프로덕션 환경이고 서버 사이드 오류일 경우 메세지 숨김
  if(process.env.NODE_ENV === 'production' && Math.floor(error.code/100) !== 4) {
    error.message = 'Temporary error occurred';
  }

  // 에러메세지가 설정되지 않은 경우 기본 메세지 표시
  if(!error.message) {
    if(error.code === 400) error.message = _t('전달값이 올바르지 않습니다.');
  }

  if(replyFormat === 'json') {
    const jsonBody = {'message' : error.message};

    if(error.meta) jsonBody.meta = error.meta;
    if(error.correctiveUri) jsonBody.correctiveUri = error.correctiveUri;

    res.json(jsonBody);
  } else { // html
    res.render('error/default', {
      message : error.message
    });
  }
}

function ErrorHandlers(app, replyFormat) {
  if(!replyFormat) replyFormat = 'json';

  // 404
  app.use(function(req, res, next) {
    reply(res, new ReplyableError(404, 'Page not found'), replyFormat);
  });

  // 404 외 오류
  app.use(function(err, req, res, next) {
    if(!(err instanceof ReplyableError) && !(err instanceof CustomError)) {
      logger.error(err.message, err.meta);
      return reply(res, new ReplyableError(500, typeof err === 'string' ? err : err.message, err.meta ? err.meta : null), replyFormat);
    } else {
      logger.log(Math.floor(err.code/100) === 4 ? 'info' : 'error', err.message, err.meta);
      return reply(res, err, replyFormat);
    }
  });
}

module.exports = ErrorHandlers;