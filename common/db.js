import mysql from 'mysql';

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  debug    : true,
  database : 'Tas'
});

export default connection;
