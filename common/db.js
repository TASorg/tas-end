import mysql from 'mysql';

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  debug    : false,
  database : 'tas'
});

export default connection;
