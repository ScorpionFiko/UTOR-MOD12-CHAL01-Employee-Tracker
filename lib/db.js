const mysql = require('mysql2');
const inquirer = require('inquirer');

class DB {
  constructor(cli) {
    if (this.constructor.instance) {
      return this.constructor.instance;
    }
    this.constructor.instance = this;
    this.cli = cli;
    this.dbConnection;

    this.sqlPasswordPrompt = [
      {
        name: "username",
        type: "input",
        message: "Enter your MySQL username",
      },
      {
      name: "password",
      type: "password",
      mask: "*",
      message: "Enter your MySQL password",
    }
  ];
  }

  connectToDb() {
    return inquirer
      .prompt(this.sqlPasswordPrompt)
      .then((answers) => {
        return mysql.createConnection(
          {
            host: 'localhost',
            user: answers.username,
            password: answers.password,
            database: 'employeetracker_db'
          });
      }).then((connection) => {
        connection.ping((err) => {
          if (err) {
            console.log(`Error connecting to database. Please try again!`);
            this.connectToDb();
          } else {
            this.dbConnection = connection;
            this.cli.presentMainMenu();
          }
        })
      })
      .catch((err) => {
        console.log(err);
        console.log('Oops. Something went wrong.');
      });
  }
}
module.exports = DB;