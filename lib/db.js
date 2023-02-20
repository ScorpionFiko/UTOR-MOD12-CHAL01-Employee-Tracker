const mysql = require('mysql2');


class DB {
  constructor(password) {
    if (this.constructor.instance) {
      return this.constructor.instance;
    }
    this.constructor.instance = this;
    this.password = password;
  
  }
  connectToDb() {
    return mysql.createConnection(
      {
        host: 'localhost',
        user: 'root',
        password: this.password,
        database: 'employeetracker_db'
      });
  }
}
module.exports = DB;