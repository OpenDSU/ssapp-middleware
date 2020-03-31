require("../../../psknode/bundles/testsRuntime");

const dc = require("double-check");
const assert = dc.assert;

const middleware = require("../");
const utils = require('./utils');

assert.callback('Middleware simple path matching', (done) => {
    const server = middleware.getMiddleware();
    const request = utils.createRequest({
        url: 'http://localhost/test'
    });
    const response = utils.createResponse();

    server.use('/test', (req, res) => {
        done();
    })
    server.executeRequest(request, response);
});
