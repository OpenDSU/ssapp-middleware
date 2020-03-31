const EventResponse = require("../lib/EventResponse").EventResponse;
const EventRequest = require("../lib/EventRequest").EventRequest;

function createRequest(params) {
    params = params || {};
    return new EventRequest({
        request: {
            body: params.body,
            method: params.method || 'GET',
            url: params.url || 'http://localhost',
            headers: {
                entries: () => {
                    return params.headers || [];
                }
            }
        }
    });
}

function createResponse() {
    const rawResponses = [];
    let doneCallback;

    const response = new EventResponse({
        sendResponse: (payload, httpOptions) => {
            rawResponses.push({
                payload,
                httpOptions
            });
            doneCallback();
        }
    })

    response.getRawResponses = () => {
        return rawResponses;
    };

    response.resolver = (callback) => {
        doneCallback = callback;
    }

    return response;
}

module.exports = {
    createRequest,
    createResponse
}
