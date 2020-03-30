const unsupportedMethods = ["append", "redirect", "location", "links", "jsonp", "render", "sendFile"];
const unsupportedProperties = ["app", "headersSent", "locals"];
const httpStatuses = require("./HttpStatuses").httpStatuses;

/*
* sendResponse instance method used to send reponse on event
***/
let sendResponse = function (responseBody, status) {
    let eventStatus = httpStatuses[status] ? {status: status, statusText: httpStatuses[status]} : {
        "status": 200,
        "statusText": "OK"
    };
    let eventResponse = responseBody || "";

    if (!this.resolver) {
        throw new Error("Event resolver is not defined!. It sholuld be a promise resolver!")
    }
    let response = new Response(eventResponse, eventStatus);
    this.resolver(response);
}

function EventResponse(event) {
    let statusCode = undefined;
    let responseHeaders = {};

    this.attachment = function (path) {
        //TOOD read from path using browserfs or EDFS

        let string = "This is a text!";

        let fileBlob = new Blob([string], {
            type: "application/octet-stream"
        });

        let init = {
            status: 200, statusText: "OK", headers: {
                "Content-Disposition": ' attachment; filename="rafa.txt"',
                "Content-Type": "text/plain"
            }
        };
        event.sendResponse(fileBlob, init);
    };
    /**
     * Sets the response’s HTTP header field to value. To set multiple fields at once, pass an object as the parameter.
     * @param params
     */
    this.set = function (...params) {
        if (params.length === 2 && typeof params[0] === "string" && typeof params[1] === "string") {
            responseHeaders[params[0]] = params[1];
        }
        else if (params.length === 1 && typeof params[0] === "object") {
            responseHeaders = params[0];
        }
        else {
            throw new Error("This function accepts as arguments an object or two strings ")
        }
    };
    /**
     * Returns the HTTP response header specified by field. The match is case-insensitive.
     * @param field
     */
    this.get = function (field) {

       let headerName = Object.keys(responseHeaders).find(headerName=>{
           return headerName.toLowerCase() === field.toLowerCase();
       });

       return responseHeaders[headerName];

    };
    /**
     * Sends a JSON response. This method sends a response (with the correct content-type) that is the parameter
     * converted to a JSON string using JSON.stringify().
     * The parameter can be any JSON type, including object, array, string, Boolean, number, or null, and you can
     * also use it to convert other values to JSON.
     * @param body
     */
    this.json = json => {
        let jsonResponse = new Blob([JSON.stringify(json)], {type: "application/json"});
        event.sendResponse(jsonResponse, this.statusCode);
    };

    this.status = status => {
        statusCode = status;
        return this;
    };

    /**
     * Send a native Response through
     *
     * @param {Response} response
     */
    this.sendRaw = response => {
        response.blob().then((blob) => {
            event.sendResponse(blob, response.status);
        });
    };

    this.send = body => {
        let contentType = 'application/octet-stream';
        //TODO check if message should be stringified

        if (responseHeaders['Content-Type']) {
          contentType = responseHeaders['Content-Type'];
        }

        let arrayBuffer = new Blob([body], {
            type: contentType
        });

        event.sendResponse(arrayBuffer, statusCode);
    };

    /**
     * Send HTTP error
     * @param {string} message
     * @param {Number} code
     * @param {string} contentType
     */
    this.sendError = (code, message, contentType) => {
        statusCode = code || 500;
        message = message || '';

        if (typeof message !== 'string') {
            message = JSON.stringify(message);
        }

        contentType = contentType || responseHeaders['Content-Type'];
        contentType = contentType || 'text/plain';

        this.status(statusCode);
        this.set('Content-Type', contentType);
        this.send(message);
    };

    /**
     * TODO
     * wip
     **/
    this.write = stream => {
       console.error("Not implemented");
    };
    this.end = () => {
        event.sendResponse("", statusCode);
    };


    /**
     * Add handlers for unimplemented methods
     * TODO extract these and see also @EventRequest
     */
    unsupportedProperties.forEach(unsupportedProperty => {
        Object.defineProperty(this, unsupportedProperty, {
            get: function () {
                throw new Error("Property " + unsupportedProperty + " is not supported!")
            }
        })
    });

    unsupportedMethods.forEach(unsupportedMethod => {
        Object.defineProperty(this, unsupportedMethod, {
            get: function () {
                throw new Error("Method " + unsupportedMethod + " is not supported!")
            }
        })
    });
}

//FetchEvent is available only in service workers

if(typeof FetchEvent!== "undefined")
{
    FetchEvent.prototype.sendResponse = sendResponse;
}

exports.EventResponse = EventResponse;
