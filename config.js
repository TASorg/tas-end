var env = process.env.NODE_ENV || "dev"
if (env != 'dev' && env != 'qa' && env != 'production') {
    env = 'dev';
}
var config = {
    'dev': {
        port: 3000,
        apiUrl: 'http://test.zhid58.com:8080',
        domain: 'http://wetest.zhid58.com',
        // redis 配置，默认是本地
        redis: {
            host: '127.0.0.1',
            port: 6379,
            db: 0,
            prefix: 'folkh5'        },
        session_secret: 'folkh5_f%95te*uw*r3cr5k59rmplz4d1(t*oe$u@#ct1!ytnt5133e_o', // 务必修改
        auth_cookie_name: 'slarkh5_',
        qiniu: {
            access_key: 'OSdX1ifRSsfMYxJGQPH95BkPPAIRI2sSKWfQ-153',
            secret_key: 'GserwkO4mA7P3VYtS51frK6OhaC9U0xSDcvV3Dwd',
            bucket: 'luoteng',
            base_url: 'http://7xl9qr.com1.z0.glb.clouddn.com/'
        },
        weixin_access: {
            appid: 'wx5e4403178a799317',
            secret: 'd4624c36b6795d1d99dcf0547af5443d',
            oauth_url: 'https://open.weixin.qq.com/connect/oauth2/authorize',
            token_url: 'https://api.weixin.qq.com/sns/oauth2/access_token'
        },
        weixin_template: {
            pay_success: '8Nx6veHHWirb-x2HdoVFB1EO7LLk9bFbH229HKvbAK4',
            order_status: 'KdCt8TKeAwvy7iN82ZTpDZhqUyOGaOxZXeq1_6hKHY0',
            hongbao: 'JH5cSK32BFt6SCUFvwzynD0TmHTZ4KnYZRY3JJ8nv1k'
        }
    },
    'qa': {
        port: 3001,
        apiUrl: 'http://10.251.193.194:8080',
        domain: 'http://wetest.zhid58.com',
        redis: {
            host: '127.0.0.1',
            port: 6379,
            db: 1,
            prefix: 'folkh5'
        },
        session_secret: 'folkh5_f%95te*uw*r3cr5k59rmplz4d1(t*oe$u@#ct1!ytnt5133e_o', // 务必修改
        auth_cookie_name: 'folkh5_',
        qiniu: {
            access_key: 'OSdX1ifRSsfMYxJGQPH95BkPPAIRI2sSKWfQ-153',
            secret_key: 'GserwkO4mA7P3VYtS51frK6OhaC9U0xSDcvV3Dwd',
            bucket: 'luoteng',
            base_url: 'http://7xl9qr.com1.z0.glb.clouddn.com/'
        },
        weixin_access: {
            appid: 'wx5e4403178a799317',
            secret: 'd4624c36b6795d1d99dcf0547af5443d',
            oauth_url: 'https://open.weixin.qq.com/connect/oauth2/authorize',
            token_url: 'https://api.weixin.qq.com/sns/oauth2/access_token'
        },
        weixin_template: {
            pay_success: '8Nx6veHHWirb-x2HdoVFB1EO7LLk9bFbH229HKvbAK4',
            order_status: 'KdCt8TKeAwvy7iN82ZTpDZhqUyOGaOxZXeq1_6hKHY0',
            hongbao: 'JH5cSK32BFt6SCUFvwzynD0TmHTZ4KnYZRY3JJ8nv1k'
        }
    },
    'production': {
        port: 3000,
        apiUrl: 'http://10.46.167.86:8080',
        domain: 'http://zhid58.com',
        redis: {
            host: '127.0.0.1',
            port: 6379,
            db: 0,
            prefix: 'folkh5'

        },
        session_secret: 'folkh5_f%95te*uw*r3cr5k59rmplz4d1(t*oe$u@#ct1!ytnt5133e_o', // 务必修改
        auth_cookie_name: 'folkh5_',
        qiniu: {
            access_key: 'OSdX1ifRSsfMYxJGQPH95BkPPAIRI2sSKWfQ-153',
            secret_key: 'GserwkO4mA7P3VYtS51frK6OhaC9U0xSDcvV3Dwd',
            bucket: 'luoteng',
            base_url: 'http://7xl9qr.com1.z0.glb.clouddn.com/'
        },
        weixin_access: {
            appid: 'wx254dcfe98729df4b',
            secret: 'e3e28c51fb45d31bb1ae70c4c76afe26',
            oauth_url: 'https://open.weixin.qq.com/connect/oauth2/authorize',
            token_url: 'https://api.weixin.qq.com/sns/oauth2/access_token'
        },
        weixin_template: {
            pay_success: '8Nx6veHHWirb-x2HdoVFB1EO7LLk9bFbH229HKvbAK4',
            order_status: 'KdCt8TKeAwvy7iN82ZTpDZhqUyOGaOxZXeq1_6hKHY0',
            hongbao: 'JH5cSK32BFt6SCUFvwzynD0TmHTZ4KnYZRY3JJ8nv1k'
        }
    }
};

module.exports = config[env];
