import db from '../../common/db';
import uuid from 'node-uuid'; //todo 自己写
import sha1 from 'sha1';


exports.say = (req, res) => {
	var data = {};
	var flag = true;
	data.i_url = req.body.url || (flag = false);
	data.i_id = uuid.v4();
// 	// res.send(req.session.user);
// 	console.log(req.session.user);
	data.u_id = req.session.user.u_id;
	data.u_name = req.session.user.u_name;
	data.i_type = 'image';

	if(!flag) {
		res.end('填写正确的数据');
	} else {//判断数据重复性
		db.query('INSERT INTO image SET ?', data, function(err, result) {
			if(err) {
				res.json({code: err});
				// res.send('inser error' + err);
			} else {
				res.json({code: 'suess'});
				// res.send('插入数据成功');
			}
		});
	}
};