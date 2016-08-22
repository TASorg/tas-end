import db from '../../common/db';
import uuid from 'node-uuid'; //todo 自己写
import request from 'request';

import Promise from 'bluebird';

import cheerio from 'cheerio';
import sha1 from 'sha1';
import jwt from 'jsonwebtoken';
import phridge from "phridge";

import array from 'lodash/array';
import config from '../../config';

const itemKey = config.ITEM_JWT_KEY;
const userKey = config.USER_JWT_KEY;

/**
 * 发表
 * @TODO 增加前置条件，判断是否登录
 * @TODO 判断数据是否重复
 */
exports.say = (req, res) => {
    var data = {};
    var flag = true;
    var type = req.body.type || 'word';
    var decoded = null;

    var b_url = /^(((ht|f)tp(s?))\:\/\/)?(www.|[a-zA-Z].)[a-zA-Z0-9\-\.]+\.(com|edu|gov|mil|net|org|biz|info|name|museum|us|ca|uk)(\.cn)?(\:[0-9]+)*(\/($|[a-zA-Z0-9\.\,\;\?\'\\\+&amp;%\$#\=~_\-]+))*$/.test(req.body.content);

    if(type == 'image') {
        data.url = req.body.url;
    } else if(b_url) {
        var url = req.body.content;
        type = 'url';
        if(url.indexOf('http') === 0) {
            var url = url;
            if(url.indexOf('item.taobao.com') !== -1) {
                type = 'taobao'; // ? type = 'goods'
                data.url = url;
                getGoodsInfo(req, res, type, flag, data);
                return false;
            } else {
              if(url.indexOf('music.163.com') !== -1) {
                data.url = 'url';
                // http://music.163.com/#/song?id=31168234
                var id = url.split('=')[1];
                getNetMusicInfo(id).then(function(_data) {
                  var _data = JSON.parse(_data);
                  // console.log(_data);

                  var song = _data.songs[0];
                  var type = 'net_music';
                  data.type = 'net_music';
                  data.mp3_url = song.mp3Url;
                  data.cover_img =  song.album.blurPicUrl;
                  data.duration = song.duration;
                  data.artists = song.artists[0].name;
                  data.title = song.name;

                  // data.
                  say2MusicDB(req, res, type, flag, data);
                  // console.log('00000000000000000000');
                });
                return false;
              }
              data.url = url;
              getTitle(req.body.content).then(function(t) {
                  data.title = t;
                  say2DB(req, res, type, flag, data);
              });
            }
            return false;
        } else {
            var url = 'http:\\\\' + url;
        }

        data.url = url;
        getTitle(req.body.content).then(function(t) {
            data.title = t;
            say2DB(req, res, type, flag, data);
        });
    } else {
        data.content = req.body.content || (flag = false);
        say2DB(req, res, type, flag, data);
    }
};


// read
exports.read = (req, res) => {
    var u_id_arr = [];
    var down_u_id_arr = [];
    var i = 0;
    var u_id = '-1';
    var num = req.query.num || 0;
    var pageSize = 6;
    var offset = num * pageSize;

    jwt.verify(req.query.tk, userKey, function(err, decoded) {
        if(!err || (req.query.tk == 'null') || (!req.query.tk)) {

            db.query('SELECT * FROM item ORDER BY time DESC LIMIT ?, ?', [offset, pageSize], function(err, result) {
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

// delete
exports.delete = (req, res) => {
    var item_token = req.body.i_token;
    var u_token = req.body.u_token;
    var i_u_id = null; // item token user uuid
    var u_u_id = null; // user token user uuid
    var i_uuid = null; // item  uuid

    jwt.verify(item_token, itemKey, function(err, decoded) {
        if(err) {
            res.json({
                code: 401,
                msg: 'token无效'
            })
        } else {
            i_u_id = decoded.u_id;
            i_uuid = decoded.uuid;

            jwt.verify(u_token, userKey, function(err, decoded) {
                if(err) {
                    res.json({
                        code: 401,
                        msg: 'token无效'
                    })
                } else {
                    u_u_id = decoded.u_id;
                    if(i_u_id == u_u_id) {
                        db.query('DELETE FROM item WHERE uuid = ?', i_uuid, function(err, result) {
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
                                    msg: '删除成功'
                                })
                            }
                        })
                    } else {
                        res.json({
                            code: '405',
                            msg: '没有权限删除'
                        })
                    }
                }
            })
        }
    })
}

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
    jwt.verify(req.body.token, userKey, function(err, decoded) {
        if(err) {
            res.json({
                code: 401,
                msg: 'token无效'
            })
        } else {
            u_id = decoded.u_id;

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

    // @TODO 抽离成单元
    jwt.verify(req.body.token, userKey, function(err, decoded) {
        if(err) {
            res.json({
                code: 401,
                msg: 'token无效'
            })
        } else {

            u_id = decoded.u_id;

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

/**
 * 根据URL获取title
 */
function getTitle(url) {
    if(url.indexOf('http') === 0) {
        var url = url;
    } else {
        var url = 'http:\\\\' + url;
    }
    return new Promise(function(resolve, reject) {
        request.get(url, function(err, res, body) {
            if(err) {
                reject(err);
            } else {
                res.setEncoding('utf-8');
                var html = body.toString();
                var $ = cheerio.load(html);
                var title = $('title').text();
                resolve(title);
                // return title;
            }

        })
    })
}

function say2DB(req, res, type, flag, data) {
    // data.content = req.body.content || (flag = false);
    // @TODO 抽离成单元
    jwt.verify(req.body.token, userKey, function(err, decoded) {
        if(err) {
            return res.json({
                code: 401,
                msg: 'token无效'
            })
        } else {
            data.uuid = uuid.v4();
            data.u_id = decoded.u_id;
            data.u_name = decoded.u_name;
            data.type = req.body.type || type;

            data.token = jwt.sign({
                    uuid: data.uuid,
                    u_id: data.u_id
                }, itemKey);

            console.log(data);

            if(!flag) {
                return res.json({sub: '填写正确的数据'});
            } else {//判断数据重复性
                db.query('INSERT INTO item SET ?', data, function(err, result) {
                    if(err) {
                        return res.json({
                            code: 401,
                            param: {
                                msg:'写入数据库失败',
                                sub: err,
                                data: data
                            }
                        });
                    } else {
                        return res.json({
                            code: 200,
                            msg: '插入数据成功'
                        });
                    }
                });
            }
        }
    });
}

//网易云音乐数据插入

function say2MusicDB(req, res, type, flag, data) {
  // data.content = req.body.content || (flag = false);
  // @TODO 抽离成单元
  jwt.verify(req.body.token, userKey, function(err, decoded) {
      if(err) {
          return res.json({
              code: 401,
              msg: 'token无效'
          })
      } else {
          data.uuid = uuid.v4();
          data.u_id = decoded.u_id;
          data.u_name = decoded.u_name;
          data.type = req.body.type || type;

          data.token = jwt.sign({
                  uuid: data.uuid,
                  u_id: data.u_id
              }, itemKey);

          console.log(data);

          if(!flag) {
              return res.json({sub: '填写正确的数据'});
          } else {//判断数据重复性
              db.query('INSERT INTO music SET ?', data, function(err, result) {
                  if(err) {
                      return res.json({
                          code: 401,
                          param: {
                              msg:'写入数据库失败',
                              sub: err,
                              data: data
                          }
                      });
                  } else {
                      return res.json({
                          code: 200,
                          msg: '插入数据成功'
                      });
                  }
              });
          }
      }
  });
}

//网易云音乐信息抓取
function getNetMusicInfo(id) {
  var apiUrl = 'http://music.163.com/api/song/detail?id='
             + id + '&ids=[' + id + ']';

  return new Promise(function(resolve, reject) {
      request.get(apiUrl, function(err, res, body) {
          if(err) {
              reject(err);
          } else {
              resolve(body);
          }

      })
  })
}

//商品信息抓取
function getGoodsInfo(req, res, type, flag, data) {

// phridge.spawn() creates a new PhantomJS process
phridge.spawn()
    .then(function (phantom) {
        var url = data.url;
        return phantom.openPage(url);
    })
    .then(function (page) {
        return page.run(function () {
            return this.evaluate(function (req, res, type, flag, data) {
                return {
                    price: document.querySelector("#J_PromoPriceNum").innerText,
                    cover_img: document.querySelector("#J_ImgBooth").getAttribute('src'),
                    title: document.title
                }
            });
        });
    })
    .then(function (_data) {
        data.price = _data.price;
        data.cover_img = _data.cover_img;
        data.title = _data.title;
        console.log(data);
    })
    .catch(function (err) {
        console.error(err.stack);
    })

    .then(phridge.disposeAll)
    .then(function () {
        say2DB(req, res, type, flag, data);
    });

}
