require("../../../psknode/bundles/testsRuntime");

const dc = require("double-check");
const assert = dc.assert;

const middleware = require("../");
const utils = require('./utils');

assert.callback('Middleware multiple param matching', (done) => {
    const server = middleware.getMiddleware();
    const request = utils.createRequest({
        url: 'http://localhost/test/value/second-value'
    });
    const response = utils.createResponse();

    server.use('/test/:param1/:param2', (req, res) => {
        assert.objectHasFields(req.params, {
            param1: 'value',
            param2: 'second-value'
        });
        done();
    })
    server.executeRequest(request, response);
});
