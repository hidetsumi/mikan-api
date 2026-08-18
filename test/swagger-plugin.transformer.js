const { before } = require('@nestjs/swagger/plugin');

module.exports.name = 'nestjs-swagger-plugin';
module.exports.version = 2;
module.exports.factory = (cs) => before({ introspectComments: true }, cs.program);
