import db from '../../common/db';
import uuid from 'node-uuid'; //todo 自己写
import sha1 from 'sha1';
import randToken from 'rand-token';
import jwt from 'jsonwebtoken';

exports.all = (req, res) => {
	console.log('test console.log api');
	db.query('SELECT name from fmin ',function(err, rows) {
		console.log(rows[0]);
		res.send('User update too database with add ID');
	});
}

/**
 * 用户注册
 * {用户名： username}, {密码： password}，{邮箱： email}
 */

exports.register = (req, res) => {
	var data = {};
	var flag = true;
	var token = randToken.generate(32);

	console.log(req.body);
	data.u_name = req.body.username || (flag = false);
	data.u_email = req.body.email || (flag = false);
	data.u_password = req.body.password ? sha1(req.body.password) : (flag = false);
	data.u_id = uuid.v4();
	data.u_token = token;

	if(!flag) {
		res.end('填写正确的数据');
	} else {
		db.query('SELECT * FROM user WHERE u_name = ?', req.body.username, function(err, rows, fields) {
			if(rows.length >= 0) {
				res.send('用户名已被注册');
			} else {
				db.query('INSERT INTO user SET ?', data, function(err, result) {
					if(err) {
						res.send('inser error' + err);
					} else {
						res.send(result);
					}
				})
			}
		});
	}
};


exports.login = (req, res) => {
	var data = req.body;

	// var token = randToken.generate(32);
	// var token = jwt.sign({user_id: 123}, 'keyvalue');

	if(!data.username) {
		res.send('请输入用户名');
	}
	db.query('SELECT * FROM user WHERE u_name = ? ', data.username, function(err, results, fields) {
		if(err) throw err;
		console.log(results);
			// res.send(results[0]);

		if(results.length > 0 && (sha1(data.password) == results[0].u_password))  {
			
			req.session.user = results[0];
			res.json({
				data: {
					username: results[0].u_name
				},
				token: jwt.sign({
					uuid: results[0].u_id,
					u_id: results[0].id,
					u_name: results[0].u_name
				},'keyvalue'),
				code: 200
			});
		} else {
			res.json({data: '用户名或密码错误'});
		}
	})
}