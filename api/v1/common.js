var qiniu = require('qiniu');
var config = require('../../config');

exports.uploadToken = function(req, res, next) {

    var key = 'uploadToken';
    var putPolicy = null;

 //  	res.setHeader("Access-Control-Allow-Origin","*");
	// res.setHeader("Access-Control-Allow-Headers","Content-Type,Accept,Authorization");
	// res.setHeader("Access-Control-Allow-Methods","GET,POST,PUT,UPDATE,DELETE");

    qiniu.conf.ACCESS_KEY = config.qiniu.access_key;
    qiniu.conf.SECRET_KEY = config.qiniu.secret_key;

    try {
        //构建上传策略函数
        putPolicy = new qiniu.rs.PutPolicy(config.qiniu.bucket);
		// res.send(putPolicy.token());
		res.json({uptoken: putPolicy.token()})
    } catch (e) {
        return res.status(400).send({message: '获取token失败'})
    }

}