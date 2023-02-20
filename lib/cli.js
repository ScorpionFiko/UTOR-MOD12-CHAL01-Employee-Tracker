const cTable = require('console.table');
const inquirer = require('inquirer');
const DB = require('./db.js');
const Department = require('./department');
const Role = require('./role');
const Employee = require('./employee');

const DEPT_MENU = 10;
const ROLE_MENU = 20;
const EMPL_MENU = 30;
const EXIT_MENU = 999;

class CLI {
  constructor() {
    this.db;
    this.subMenu;

    this.mainMenuPrompts = [
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
  }

  presentMainMenu() {
    return inquirer
      .prompt(this.mainMenuPrompts)
      .then((answers) => {
        switch (answers.mainMenuCommand) {
          case DEPT_MENU:
            const department = new Department(this).presentSubMenu();
            break;
          case ROLE_MENU:
            const role = new Role(this).presentSubMenu();
            break;
          case EMPL_MENU:
            const employee = new Employee(this).presentSubMenu();
            break;
          case EXIT_MENU:
            process.exit();
        }
      });
  }
}

module.exports = CLI;
