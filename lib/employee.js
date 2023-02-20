const DB = require('./db');
const Department = require('./department');
const Role = require('./role');
const inquirer = require('inquirer');

const SUB_MENU_10 = 10;
const SUB_MENU_11 = 11;
const SUB_MENU_12 = 12;
const SUB_MENU_13 = 13;
const SUB_MENU_14 = 14;
const SUB_MENU_15 = 15;
const SUB_MENU_16 = 16;
const SUB_MENU_17 = 17;
const EXIT_MENU = 999;
const BACK_MENU = 998;

class Employee {
  constructor(cli) {
    this.cli = cli;
    this.add = false;
    this.updateName = false;
    this.updateRole = false;
    this.updateManager = false;
    this.delete = false;
    this.db = new DB().dbConnection;
    this.emplMenuPrompts = [
      {
        type: 'list',
        message: `\x1b[46mEmployee Command Menu\x1b[0m\nWhat would you like to do?`,
        name: 'subMenuCommand',
        choices: [
          { name: `View all employees`, value: SUB_MENU_10 },
          { name: `View all employees by Manager`, value: SUB_MENU_11 },
          { name: `View all employees by Department`, value: SUB_MENU_12 },
          { name: "Add an employee", value: SUB_MENU_13 },
          { name: "Update Employee Name", value: SUB_MENU_14 },
          { name: "Update Employee Role", value: SUB_MENU_15 },
          { name: "Update Employee Manager", value: SUB_MENU_16 },
          { name: "Delete an employee", value: SUB_MENU_17 },
          { name: "Back to Main Menu", value: BACK_MENU },
          { name: "Exit Application", value: EXIT_MENU }
        ]
      }
    ];

    this.emplInfoPrompts = [
      {
        type: 'list',
        message: () => { return `Select the employee you would like to ${(this.delete) ? `delete` : `update`}` },
        name: 'emplList',
        choices: () => this.getEmployeeChoices(),
        when: () => { return (this.delete || this.updateName || this.updateRole || this.updateManager) }
      },
      {
        type: 'input',
        message: () => { return `Enter ${(this.add) ? `` : `a new `}employee\'s first name:` },
        name: 'emplFirstName',
        when: () => { return (this.add || this.updateName) }
      },
      {
        type: 'input',
        message: () => { return `Enter ${(this.add) ? `` : `a new `}employee\'s last name:` },
        name: 'emplLastName',
        when: () => { return (this.add || this.updateName) }
      },
      {
        type: 'list',
        message: () => { return `Select employee\'s ${(this.add) ? `` : `a new `}role` },
        name: 'emplRole',
        choices: async () => await new Role().getRoleChoices(),
        when: () => { return (this.add || this.updateRole) }
      },
      {
        type: 'list',
        message: () => { return `Select employee\'s ${(this.add) ? `` : `a new `}manager` },
        name: 'emplManager',
        choices: async () => await this.getEmployeeChoices(true),
        when: () => { return (this.add || this.updateManager) }
      }
    ];

  }

  resetFlags() {
    this.add=false;
    this.updateName = false;
    this.updateRole = false;
    this.updateManager = false;
    this.delete=false;
  }

  presentSubMenu() {
    return inquirer
      .prompt(this.emplMenuPrompts)
      .then((answers) => {
        switch (answers.subMenuCommand) {
          //employee menus
          case SUB_MENU_10:
            this.viewAllEmployeesById();
            break;
          case SUB_MENU_11:
            this.viewAllEmployeesByManager();
            break;
          case SUB_MENU_12:
            this.viewAllEmployeesByDepartment();
            break;
          case SUB_MENU_13:
            this.add=true;
            this.addEmployee();
            break;
          case SUB_MENU_14:
            this.updateName = true;
            this.updateEmployeeInfo();
            break;
          case SUB_MENU_15:
            this.updateRole = true;
            this.updateEmployeeInfo();
            break;
          case SUB_MENU_16:
            this.updateManager = true;
            this.updateEmployeeInfo();
            break;
          case SUB_MENU_17:
            this.delete=true;
            this.deleteEmployee();
            break;
          case BACK_MENU:
            this.cli.presentMainMenu();
            break;
          case EXIT_MENU:
            process.exit();
        }

      });
  }

  // employee methods
  // selects all employees from the database and presents it to the user with the console.table library
  viewAllEmployeesById() {
    const sql = `select e.id, e.first_name, e.last_name, r.title, d.name as department, r.salary, concat(m.first_name, " ", m.last_name) as manager from employee as e left join role as r on e.role_id = r.id left join department as d on r.department_id = d.id left join employee as m on e.manager_id = m.id order by e.id asc;`;
    return this.db.promise().query(sql)
      .then(([rows, fields]) => {
        console.table(rows);
      }).catch((err) => {
        console.log(`>>> Error has occured in running the query: ${sql}\n`);
      })
      .then(() => this.presentSubMenu())
  }
  // grouping by manager
  viewAllEmployeesByManager() {
    const sql = `select concat(m.first_name, " ", m.last_name) as manager, concat(e.first_name, " ", e.last_name) as employee, r.title, d.name as department, r.salary from employee as e left join role as r on e.role_id = r.id left join department as d on r.department_id = d.id left join employee as m on e.manager_id = m.id order by m.id asc;`;
    return this.db.promise().query(sql)
      .then(([rows, fields]) => {
        console.table(rows);
      }).catch((err) => {
        console.log(`>>> Error has occured in running the query: ${sql}\n`);
      })
      .then(() => this.presentSubMenu())
  }
  // grouping by department
  viewAllEmployeesByDepartment() {
    const sql = `select d.name as department, concat(e.first_name, " ", e.last_name) as employee, r.title,  r.salary, concat(m.first_name, " ", m.last_name) as manager from employee as e left join role as r on e.role_id = r.id left join department as d on r.department_id = d.id left join employee as m on e.manager_id = m.id order by d.id asc;`;
    return this.db.promise().query(sql)
      .then(([rows, fields]) => {
        console.table(rows);
      }).catch((err) => {
        console.log(`>>> Error has occured in running the query: ${sql}\n`);
      })
      .then(() => this.presentSubMenu());
  }

  // adds employees to the database and presents the user with the message
  addEmployee() {
    return inquirer.prompt(this.emplInfoPrompts).then((answers) => {
      const sql = "insert into employee(first_name, last_name, role_id, manager_id) values (?, ?, ?, ?)";
      const params = [];
      params.push(answers.emplFirstName);
      params.push(answers.emplLastName);
      params.push(answers.emplRole.id);
      params.push(answers.emplManager.id);
      this.db.promise().query(sql, params)
        .then(([rows, fields]) => {
          console.log(`Added \x1b[42m${answers.emplFirstName} ${answers.emplLastName}\x1b[0m as an employee in the role of \x1b[42m${answers.emplRole.name}\x1b[0m with \x1b[42m${answers.emplManager.name}\x1b[0m ${((answers.emplManager.id === null) ? `` : `as manager `)}to the Database\n`);
        }).catch((err) => {
          console.log(`>>> Error has occured in running the query: ${sql}\n`);
        })
        .then(() => {
          this.resetFlags();
          this.presentSubMenu()
        });
    });

  }
  // deletes employee from the database and presents the user with the message
  deleteEmployee() {
    return inquirer.prompt(this.emplInfoPrompts).then((answers) => {
      const sql = "delete from employee where id= (?)";
      const params = [];
      params.push(answers.emplList.id)
      this.db.promise().query(sql, params)
        .then(([rows, fields]) => {
          console.log(`Deleted employee \x1b[42m${answers.emplList.name}\x1b[0m from the Database\n`);
        }).catch((err) => {
          console.log(`>>> Error has occured in running the query: ${sql}\n`);
        })
        .then(() => {
          this.resetFlags();
          this.presentSubMenu();
        });
    });
  }
  // update employee
  updateEmployeeInfo() {
    return inquirer.prompt(this.emplInfoPrompts).then((answers) => {
      let sql = "";
      const params = [];
      if (this.updateName) {
        sql = "update employee set first_name=?, last_name=? where id=?";
        params.push(answers.emplFirstName);
        params.push(answers.emplLastName);
      }
      if (this.updateRole) {
        sql = "update employee set role_id=? where id=?";
        params.push(answers.emplRole.id);
      }
      if (this.updateManager) {
        sql = "update employee set manager_id=? where id=?";
        params.push(answers.emplManager.id);
      }
      params.push(answers.emplList.id);
      this.db.promise().query(sql, params)
        .then(([rows, fields]) => {
          console.log(`Updated \x1b[42m${answers.emplList.name}\x1b[0m\'s information in the Database\n`);
        }).catch((err) => {
          console.log(`>>> Error has occured in running the query: ${sql}\n`);
        })
        .then(() => {
          this.resetFlags();
          this.presentSubMenu();
        })
    })

    
  }

// helper functions

  // gets the listing of employees and presents it to the user as `choices` in a list input.
  // formatted in the way [{ name: name_from_db, value: {name: name_from_db, id: id_from_database}}]
  // that way the methods can have both the name and ID and perform their manipulations
  // added "no manager" options 
  getEmployeeChoices(noManager = false) {
    const sql = "select first_name, last_name, id from employee";
    const options = [];
    return this.db.promise().query(sql).then(([rows, fields]) => {
      rows.forEach(row => {
        options.push({
          name: `${row.first_name} ${row.last_name}`,
          value: {
            name: `${row.first_name} ${row.last_name}`,
            id: row.id
          }
        });

      });
      if (noManager) {
        options.push({
          name: `no manager`,
          value: {
            name: `no manager`,
            id: null
          }
        });
      }
      return options;
    })
  }
}

module.exports = Employee;