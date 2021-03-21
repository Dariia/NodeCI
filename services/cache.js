const mongoose = require('mongoose');
let redis = require('redis');
const util = require('util');
const keys = require('..config/keys');
const redisClient = redis.createClient(keys.redisUrl);
redisClient.hget = util.promisify(redisClient.hget);
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function(options = {}){
    this.useCache = true;
    this.hashKey = JSON.stringify(options.key || '');
    return this;
}

mongoose.Query.prototype.exec = async function() {
    if (!this.useCache) {
        return exec.apply(this, arguments);
    }

    const key = JSON.stringify({...this.getQuery(), collection: this.mongooseCollection.name});
    const cachedValue = await redisClient.hget(this.hashKey, key);

    if (cachedValue) {
        const doc = JSON.parse(cachedValue);
        return Array.isArray(doc)
            ? doc.map(item => new this.model(item))
            : new this.model(doc);
    }

    const result = await exec.apply(this, arguments);
    redisClient.hset(this.hashKey, key, JSON.stringify(result), 'EX', 10);
    return result;
}
module.exports = {
    clearHash: function(hashKey){
        redisClient.del(JSON.stringify(hashKey));
    }
}
