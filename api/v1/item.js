import db from '../../common/db';
import uuid from 'node-uuid'; //todo 自己写
import sha1 from 'sha1';
import jwt from 'jsonwebtoken';


/**
 * 发表
 * @TODO 增加前置条件，判断是否登录
 * @TODO 判断数据是否重复
 */

exports.say = (req, res) => {
	var data = {};
	var flag = true;
	var decoded = null;

	var type = req.body.type;

	if(type == 'image') {
		data.url = req.body.url;
	} else {
		data.content = req.body.content || (flag = false);
	}

	// data.content = req.body.content || (flag = false);
	// @TODO 抽离成单元
	jwt.verify(req.body.token, 'keyvalue', function(err, decoded) {
		if(err) {
			res.json({
				code: 401,
				msg: 'token无效'
			})
		} else {
			data.uuid = uuid.v4();
			data.u_id = decoded.u_id;
			data.u_name = decoded.u_name;
			data.type = req.body.type || 'word';

			if(!flag) {
				res.json({sub: '填写正确的数据'});
			} else {//判断数据重复性
				db.query('INSERT INTO item SET ?', data, function(err, result) {
					if(err) {
						res.json({
							code: 401,
							param: {
								msg:'插入数据库失败',
								sub: err,
								data: data
							}
						});
					} else {
						res.json({
							code: 200,
							msg: '插入数据成功'
						});
					}
				});
			}
		}
	});
};

// read
exports.read = (req, res) => {
	db.query('SELECT * FROM item LIMIT 30', function(err, result) {
		if(err) {
			res.json({
				code: 401,
				param: {
					msg:'读取数据库失败',
					sub: err
				}
			});
		} else {
			res.json({
				code: 200,
				msg: '读取word数据成功',
				data: result
			});
		}
	});
};