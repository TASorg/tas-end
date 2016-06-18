import db from '../../common/db';
import uuid from 'node-uuid'; //todo 自己写
import sha1 from 'sha1';
import jwt from 'jsonwebtoken';
import array from 'lodash/array';

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
        console.log(decoded);
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
    var u_id_arr = [];
    var down_u_id_arr = [];
    var i = 0;
    var u_id = '-1';//'11';
    console.log(req.query.tk);
    jwt.verify(req.query.tk, 'keyvalue', function(err, decoded) {
        console.log(err);
        console.log('-------');
        if(!err || (req.query.tk == 'null') || (!req.query.tk)) {

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
                    if(decoded) {
                        u_id = decoded.u_id;
                    }
                    for(i = 0; i < result.length; i++) {
                        (function(i) {
                            u_id_arr = result[i].up_id.split(',');
                            down_u_id_arr = result[i].down_id.split(',');
                            if(array.indexOf(u_id_arr, (u_id).toString()) == -1) { //不存在
                                result[i].isUp = 0;
                            } else {
                                result[i].isUp = 1;
                            }

                            if(array.indexOf(down_u_id_arr, (u_id).toString()) == -1) { //不存在
                                result[i].isDown = 0;
                            } else {
                                result[i].isDown = 1;
                            }

                        })(i)
                        
                    }
                    res.json({
                        code: 200,
                        msg: '读取数据成功',
                        data: result
                    });
                }
            });
        } else {
            res.json({
                code: 401,
                msg: 'token无效'
            })
        }
    });

};

//up 
exports.upVote = (req, res) => {
    var data = {};
    var flag = true;
    var decoded = null;
    var uuid = req.body.uuid;
    var u_id = null;
    var old_u_id = null; //已点赞用户id
    var u_id_arr = [];
    var down_u_id_arr = [];

    // @TODO 抽离成单元
    jwt.verify(req.body.token, 'keyvalue', function(err, decoded) {
        if(err) {
            res.json({
                code: 401,
                msg: 'token无效'
            })
        } else {
            u_id = decoded.u_id;// + ',';

            if(!flag) {
                res.json({sub: '填写正确的数据'});
            } else {//判断数据重复性
                //@TODO 重要优化
                // 做性能测试，尽量两次查询转化为一次查询
                // 或者转化为redis模式存储点赞逻辑

                db.query('SELECT up_id, down_id FROM item WHERE uuid = ?', uuid, function(err, result) {
                    if(err) {
                        res.json({
                            code: 401,
                            param: {
                                msg:'读取数据库失败',
                                sub: err
                            }
                        });
                    } else {
                        u_id_arr = result[0].up_id.split(',');
                        down_u_id_arr = result[0].down_id.split(',');

                        console.log(u_id_arr);
                        if(array.indexOf(u_id_arr, (u_id).toString()) != -1) { //不存在
                            res.json({
                                code: 402,
                                param: {
                                    msg: '已经点过赞'
                                }
                            })
                        } else if(array.indexOf(down_u_id_arr, (u_id).toString()) != -1) {
                            res.json({
                                code: 403,
                                param: {
                                    msg: 'already down'
                                }
                            })
                        } else {
                            old_u_id = result[0].up_id + ',';
                            u_id = old_u_id + u_id;
                            db.query('UPDATE item SET up = up + 1, up_id = ? WHERE uuid = ?', [u_id, uuid], function(err, result) {
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
                                        msg: '点赞成功',
                                        data: result
                                    });
                                }
                            });                                 
                        }
                    }
                })
            }
        }
    });
}

/**
 * 用户点赞操作
 * @param 
 */
exports.downVote = (req, res) => {
    var data = {};
    var flag = true;
    var decoded = null;
    var uuid = req.body.uuid;
    var u_id = null;
    var old_u_id = null; //已点赞用户id
    var u_id_arr = [];
    var down_u_id_arr = [];
    // var down_u_id_arr = [];

    // data.content = req.body.content || (flag = false);
    // @TODO 抽离成单元
    jwt.verify(req.body.token, 'keyvalue', function(err, decoded) {
        if(err) {
            res.json({
                code: 401,
                msg: 'token无效'
            })
        } else {

            u_id = decoded.u_id;// + ',';

            if(!flag) {
                res.json({sub: '填写正确的数据'});
            } else {//判断数据重复性
                //@TODO 重要优化
                // 做性能测试，尽量两次查询转化为一次查询
                // 或者转化为redis模式存储点赞逻辑

                db.query('SELECT up_id,down_id FROM item WHERE uuid = ?', uuid, function(err, result) {
                    if(err) {
                        res.json({
                            code: 401,
                            param: {
                                msg:'读取数据库失败',
                                sub: err
                            }
                        });
                    } else {
                        u_id_arr = result[0].up_id.split(',');
                        down_u_id_arr = result[0].down_id.split(',');
                        if(array.indexOf(u_id_arr, (u_id).toString()) != -1) { //存在
                            res.json({
                                code: 402,
                                param: {
                                    msg: '已经点过赞'
                                }
                            })
                        } else if(array.indexOf(down_u_id_arr, (u_id).toString()) != -1) {
                            res.json({
                                code: 403,
                                param: {
                                    msg: 'already down'
                                }
                            })
                        } else {
                            old_u_id = result[0].up_id + ',';
                            u_id = old_u_id + u_id;
                            db.query('UPDATE item SET down = down + 1, down_id = ? WHERE uuid = ?', [u_id, uuid], function(err, result) {
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
                                        msg: 'say NO成功',
                                        data: result
                                    });
                                }
                            });                                 
                        }
                    }
                })
            }
        }
    });


}