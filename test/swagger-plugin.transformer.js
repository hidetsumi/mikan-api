const { before } = require('@nestjs/swagger/plugin');

module.exports.name = 'nestjs-swagger-plugin';
module.exports.version = 1;
module.exports.factory = (cs) => before({}, cs.program);
