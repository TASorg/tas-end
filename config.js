var env = process.env.NODE_ENV || "dev"
if (env != 'dev' && env != 'qa' && env != 'production') {
    env = 'dev';
}
var config = {
  'dev': {
    USER_JWT_KEY: 'keyvalue',
    ITEM_JWT_KEY: 'item_token*&^',
    qiniu: {
        access_key: 'OSdX1ifRSsfMYxJGQPH95BkPPAIRI2sSKWfQ-153',
        secret_key: 'GserwkO4mA7P3VYtS51frK6OhaC9U0xSDcvV3Dwd',
        bucket: 'luoteng',
        base_url: 'http://7xl9qr.com1.z0.glb.clouddn.com/'
    }
  }
};

module.exports = config[env];
