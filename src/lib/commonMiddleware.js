import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";
import httpEventNormalizer from "@middy/event-normalizer";

function postMiddleWare(handler) {
  return middy(handler).use([
    httpJsonBodyParser(),
    httpErrorHandler(),
    httpEventNormalizer(),
  ]);
}
function getMiddleware(handler) {
  return middy(handler).use([httpErrorHandler(), httpEventNormalizer()]);
}

export { postMiddleWare, getMiddleware };
