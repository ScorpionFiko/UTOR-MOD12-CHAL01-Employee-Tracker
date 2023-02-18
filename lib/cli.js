const inquirer = require('inquirer');
const mysql = require('mysql2');
const DB = require('./db.js');
const cTable = require('console.table');

const DEPT_MENU = 10;
const DEPT_MENU_TEXT = 'Departmental Command Menu';
const ROLE_MENU = 20;
const EMPL_MENU = 30;
const MAIN_MENU = 40;
const EXIT_MENU = 999;
const BACK_MENU = 998;
// submenus 10 ~ 29 are departmental menus
const SUB_MENU_10 = 10;
const SUB_MENU_11 = 11;
const SUB_MENU_12 = 12;
const SUB_MENU_13 = 13;
// submenus 30 ~ 59 are role menus
const SUB_MENU_50 = 50;
const SUB_MENU_60 = 60;


class CLI {
  constructor() {
    this.db;
    this.subMenu;
    this.mainMenu = [
      {
        type: 'list',
        message: 'What would you like to do?',
        name: 'mainMenuCommand',
        choices: [
          { name: "Access Departmental Command Menu", value: DEPT_MENU },
          { name: "Access Role Command Menu", value: ROLE_MENU },
          { name: "Access Employee Command Menu", value: EMPL_MENU },
          { name: "Exit Application", value: EXIT_MENU }
        ]
      }
    ];
    this.deptMenu = [
      {
        type: 'list',
        message: () => { return `${this.subMenu}\nWhat would you like to do?` },
        name: 'subMenuCommand',
        choices: [
          { name: `view all departments`, value: SUB_MENU_10 },
          { name: "add a department", value: SUB_MENU_11 },
          { name: "delete a department", value: SUB_MENU_12 },
          { name: "Back to Main Menu", value: BACK_MENU },
          { name: "Exit Application", value: EXIT_MENU }
        ]
      }
    ];
    this.addDept = [
      {
        type: 'input',
        message: 'Enter Department Name:',
        name: 'newDept',
      }
    ];
  }
  run() {
    return inquirer
      .prompt([{
        name: "password",
        type: "password",
        mask: "*",
        message: "enter password",
      }])
      .then((answers) => {
        return new DB(answers.password.trim()).connectToDb();
      }).then((connection) => {
        connection.ping((err) => {
          if (err) {
            console.log(`Error connecting to database. Please try again!`);
            this.run();
          } else {
            this.db = connection;
            this.presentMainMenu();
          }
        })
      })
      .catch((err) => {
        console.log(err);
        console.log('Oops. Something went wrong.');
      });
  }

  presentMainMenu() {
    return inquirer
      .prompt(this.mainMenu)
      .then((answers) => {
        switch (answers.mainMenuCommand) {
          case DEPT_MENU:
            console.log("dept");
            this.subMenu = DEPT_MENU_TEXT;
            this.presentSubMenu(this.deptMenu);
            break;
          case ROLE_MENU:
            console.log("role");
            break;
          case EMPL_MENU:
            console.log("empl");
            break;
          case EXIT_MENU:
            process.exit();
        }
      });
  }

  presentSubMenu(menuOptions) {
    return inquirer
      .prompt(menuOptions)
      .then((answers) => {
        switch (answers.subMenuCommand) {
          case SUB_MENU_10:
            this.viewAllDepartments(menuOptions)
            break;
          case SUB_MENU_11:
            this.addDepartment(menuOptions)
            break;
          case SUB_MENU_12:
            console.log("delete");
            this.getDepartmentChoices();
            break;
          case BACK_MENU:
            this.presentMainMenu();
            break;
          case EXIT_MENU:
            process.exit();
        }
      });
  }

  viewAllDepartments(menuOptions) {
    const sql = "select * from department";
    return this.db.promise().query(sql)
      .then(([rows, fields]) => {
        console.table(rows);
      }).catch((err) => {
        console.log(`>>> Error has occured in running the query: ${sql}`);
      })
      .then(() => this.presentSubMenu(menuOptions))
  }

  addDepartment(menuOptions) {
    return inquirer.prompt(this.addDept).then((answers) => {
      const sql = "insert into department(name) values (?)";
      const params = [];
      params.push(answers.newDept)
      this.db.promise().query(sql, params)
      .then(([rows, fields]) => {
        console.log(`Added ${answers.newDept} to the Database`);
      }).catch((err) => {
        console.log(`>>> Error has occured in running the query: ${sql}`);
      })
      .then(() => this.presentSubMenu(menuOptions))
    })
    
  }

  async getDepartmentChoices() {
    const sql = "select * from department";
    const results = await this.db.promise().query(sql)
    return results[0];
  }

}

module.exports = CLI;
