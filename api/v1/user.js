import db from '../../common/db';
import uuid from 'node-uuid'; //todo 自己写
import sha1 from 'sha1';
import randToken from 'rand-token';
import jwt from 'jsonwebtoken';

import config from '../../config';

const userKey = config.USER_JWT_KEY;

exports.all = (req, res) => {
    db.query('SELECT name from fmin ',function(err, rows) {
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

    data.u_name = req.body.username || (flag = false);
    data.u_email = req.body.email || (flag = false);
    data.u_password = req.body.password ? sha1(req.body.password) : (flag = false);
    data.u_id = uuid.v4();
    data.u_token = token;

    if(!flag) {
        res.end('填写正确的数据');
    } else {
        db.query('SELECT * FROM user WHERE u_name = ?', req.body.username, function(err, rows, fields) {
            if(rows.length > 0) {
                res.json({msg: '用户名已被注册'});
            } else {
                db.query('SELECT * FROM user WHERE u_email = ?', req.body.email, function(err, rows, fields) {
                    if(rows.length > 0) {
                        res.json({msg: '邮箱已被注册'});
                    } else {
                        db.query('INSERT INTO user SET ?', data, function(err, result) {
                            if(err) {
                                res.json({data: 'inser error' + err});
                            } else {
                                res.json({
                                    data: {
                                        username: data.u_name
                                    },
                                    token: jwt.sign({
                                        uuid: data.u_id,
                                        u_id: result.insertId,
                                        u_name: data.u_name
                                    }, userKey),
                                    code: 200
                                });
                            }
                        })
                    }
                });
            }
        });
    }
};


exports.login = (req, res) => {
    var data = req.body;

    if(!data.username) {
        res.send('请输入用户名');
    }
    db.query('SELECT * FROM user WHERE u_name = ? ', data.username, function(err, results, fields) {
        if(err) throw err;

        if(results.length > 0 && (sha1(data.password) == results[0].u_password))  {

            res.json({
                data: {
                    username: results[0].u_name
                },
                token: jwt.sign({
                    uuid: results[0].u_id,
                    u_id: results[0].id,
                    u_name: results[0].u_name
                }, userKey),
                code: 200
            });
        } else {
            res.json({data: '用户名或密码错误'});
        }
    })
}
