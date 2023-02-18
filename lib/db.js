const mysql = require('mysql2');


class DB {
  constructor(password) {
    this.password = password;
    this.connectedToDB = false;
    if (this.constructor.instance && this.connectedToDB) {
      return this.constructor.instance;
    }
    this.constructor.instance = this;
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