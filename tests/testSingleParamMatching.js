require("../../../builds/output/testsRuntime");

const dc = require("double-check");
const assert = dc.assert;

const middleware = require("../");
const utils = require('./utils');

assert.callback('Middleware single param matching', (done) => {
    const server = middleware.getMiddleware();
    const request = utils.createRequest({
        url: 'http://localhost/test/value'
    });
    const response = utils.createResponse();

    server.use('/test/:param1', (req, res) => {
        assert.objectHasFields(req.params, {
            param1: 'value'
        });
        done();
    })
    server.executeRequest(request, response);
});
