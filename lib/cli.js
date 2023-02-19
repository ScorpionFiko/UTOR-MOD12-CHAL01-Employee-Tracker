const inquirer = require('inquirer');
const mysql = require('mysql2');
const DB = require('./db.js');
const cTable = require('console.table');

const DEPT_MENU = 10;
const DEPT_MENU_TEXT = '\x1b[46mDepartmental Command Menu\x1b[0m';
const ROLE_MENU = 20;
const ROLE_MENU_TEXT = '\x1b[46mRole Command Menu\x1b[0m';
const EMPL_MENU = 30;
const EMPL_MENU_TEXT = '\x1b[46mEmployee Command Menu\x1b[0m';
const MAIN_MENU = 40;
const EXIT_MENU = 999;
const BACK_MENU = 998;
// submenus 10 ~ 29 are departmental menus
const SUB_MENU_10 = 10;
const SUB_MENU_11 = 11;
const SUB_MENU_12 = 12;
const SUB_MENU_13 = 13;
// submenus 30 ~ 59 are role menus
const SUB_MENU_30 = 30;
const SUB_MENU_31 = 31;
const SUB_MENU_32 = 32;
const SUB_MENU_33 = 33;
// submenus 60 ~ 89 are employee menus
const SUB_MENU_60 = 60;
const SUB_MENU_61 = 61;
const SUB_MENU_62 = 62;
const SUB_MENU_63 = 63;
const SUB_MENU_64 = 64;
const SUB_MENU_65 = 65;
const SUB_MENU_66 = 66;
const SUB_MENU_67 = 67;
const SUB_MENU_68 = 68;
// update emplyoee flags
let updateEmployeeName = false;
let updateEmployeeRole = false;
let updateEmployeeManager = false;




class CLI {
  constructor() {
    this.db;
    this.subMenu;
    this.sqlPasswordPrompt = [{
      name: "password",
      type: "password",
      mask: "*",
      message: "enter password",
    }];
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
    this.deptMenuPrompts = [
      {
        type: 'list',
        message: () => { return `${this.subMenu}\nWhat would you like to do?` },
        name: 'subMenuCommand',
        choices: [
          { name: `View all departments`, value: SUB_MENU_10 },
          { name: `View the total utilized budget of a department`, value: SUB_MENU_13 },
          { name: "Add a department", value: SUB_MENU_11 },
          { name: "Delete a department", value: SUB_MENU_12 },
          { name: "Back to Main Menu", value: BACK_MENU },
          { name: "Exit Application", value: EXIT_MENU }
        ]
      }
    ];
    this.addDeptPrompts = [
      {
        type: 'input',
        message: 'Enter Department Name:',
        name: 'newDept',
      }
    ];
    this.deleteDeptPrompts = [
      {
        type: 'list',
        message: 'Select which department to delete',
        name: 'deleteDeptList',
        choices: () => this.getDepartmentChoices(),
      }
    ];

    this.roleMenuPrompts = [
      {
        type: 'list',
        message: () => { return `${this.subMenu}\nWhat would you like to do?` },
        name: 'subMenuCommand',
        choices: [
          { name: `View all roles`, value: SUB_MENU_30 },
          { name: "Add a role", value: SUB_MENU_31 },
          { name: "Delete a role", value: SUB_MENU_32 },
          { name: "Back to Main Menu", value: BACK_MENU },
          { name: "Exit Application", value: EXIT_MENU }
        ]
      }
    ];

    this.addRolePrompts = [
      {
        type: 'input',
        message: 'Enter Role Title:',
        name: 'newRoleTitle',
      },
      {
        type: 'input',
        message: 'Enter Role Salary:',
        name: 'newRoleSalary',
        validate: (salary) => {
          const digitRegex = new RegExp('[+]?\\d*\\.?\\d+');
          if (!digitRegex.test(salary)) {
            return (`Please enter a number`);
          } else {
            return true;
          }
        }
      },
      {
        type: 'list',
        message: 'Select department to which this role belongs',
        name: 'newRoleDepartment',
        choices: () => this.getDepartmentChoices(),
      }
    ];
    this.deleteRolePrompts = [
      {
        type: 'list',
        message: 'Select which role to delete',
        name: 'deleteRoleList',
        choices: () => this.getRoleChoices(),
      }
    ];
    this.emplMenuPrompts = [
      {
        type: 'list',
        message: () => { return `${this.subMenu}\nWhat would you like to do?` },
        name: 'subMenuCommand',
        choices: [
          { name: `View all employees`, value: SUB_MENU_60 },
          { name: `View all employees by Manager`, value: SUB_MENU_66 },
          { name: `View all employees by Department`, value: SUB_MENU_67 },
          { name: "Add an employee", value: SUB_MENU_61 },
          { name: "Delete an employee", value: SUB_MENU_62 },
          { name: "Update Employee Name", value: SUB_MENU_63 },
          { name: "Update Employee Role", value: SUB_MENU_64 },
          { name: "Update Employee Manager", value: SUB_MENU_65 },
          { name: "Back to Main Menu", value: BACK_MENU },
          { name: "Exit Application", value: EXIT_MENU }
        ]
      }
    ];

    this.addEmplPrompts = [
      {
        type: 'input',
        message: 'Enter Employee First Name:',
        name: 'newEmplFirstName',
      },
      {
        type: 'input',
        message: 'Enter Employee Last Name:',
        name: 'newEmplLastName',
      },
      {
        type: 'list',
        message: 'Enter Select Employee\'s role:',
        name: 'newEmplRole',
        choices: () => this.getRoleChoices(),
      },
      {
        type: 'list',
        message: 'Select employee\'s manager',
        name: 'newEmplManager',
        choices: () => this.getEmployeeChoices(true),
      }
    ];
    this.deleteEmplPrompts = [
      {
        type: 'list',
        message: 'Select which employee to delete',
        name: 'deleteEmplList',
        choices: () => this.getEmployeeChoices(false),
      }
    ];
    this.updateEmplInfoPrompts = [
      {
        type: 'list',
        message: 'Select the employee you would like to update:',
        name: 'updateEmpl',
        choices: () => this.getEmployeeChoices(),
      },
      {
        type: 'input',
        message: 'Enter Employee First Name:',
        name: 'updateEmplFirstName',
        when: () => { return updateEmployeeName }
      },
      {
        type: 'input',
        message: 'Enter Employee Last Name:',
        name: 'updateEmplLastName',
        when: () => { return updateEmployeeName }
      },
      {
        type: 'list',
        message: 'Select Employee\'s new role',
        name: 'updateEmplRole',
        choices: () => this.getRoleChoices(),
        when: () => { return updateEmployeeRole }
      },
      {
        type: 'list',
        message: 'Select Employee\'s new manager',
        name: 'updateEmplManager',
        choices: () => this.getEmployeeChoices(true),
        when: () => { return updateEmployeeManager }
      }
    ];

  }
  run() {
    return inquirer
      .prompt(this.sqlPasswordPrompt)
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
      .prompt(this.mainMenuPrompts)
      .then((answers) => {
        switch (answers.mainMenuCommand) {
          case DEPT_MENU:
            this.subMenu = DEPT_MENU_TEXT;
            this.presentSubMenu(this.deptMenuPrompts);
            break;
          case ROLE_MENU:
            this.subMenu = ROLE_MENU_TEXT;
            this.presentSubMenu(this.roleMenuPrompts);
            break;
          case EMPL_MENU:
            this.subMenu = EMPL_MENU_TEXT;
            this.presentSubMenu(this.emplMenuPrompts);
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
          // department menus
          case SUB_MENU_10:
            this.viewAllDepartments(menuOptions);
            break;
          case SUB_MENU_11:
            this.addDepartment(menuOptions);
            break;
          case SUB_MENU_12:
            this.deleteDepartment(menuOptions);
            break;
          //role menus
          case SUB_MENU_30:
            this.viewAllRoles(menuOptions);
            break;
          case SUB_MENU_31:
            this.addRole(menuOptions);
            break;
          case SUB_MENU_32:
            this.deleteRole(menuOptions);
            break;
          //employee menus
          case SUB_MENU_60:
            this.viewAllEmployeesById(menuOptions);
            break;
          case SUB_MENU_61:
            this.addEmployee(menuOptions);
            break;
          case SUB_MENU_62:
            this.deleteEmployee(menuOptions);
            break;
          case SUB_MENU_63:
            updateEmployeeName = true;
            this.updateEmployeeInfo(menuOptions);
            break;
          case SUB_MENU_64:
            updateEmployeeRole = true;
            this.updateEmployeeInfo(menuOptions);
            break;
          case SUB_MENU_65:
            updateEmployeeManager = true;
            this.updateEmployeeInfo(menuOptions);
            break;
          case BACK_MENU:
            this.presentMainMenu();
            break;
          case SUB_MENU_66:
            this.viewAllEmployeesByManager(menuOptions);
            break;
          case SUB_MENU_67:
            this.viewAllEmployeesByDepartment(menuOptions);
            break;
            case SUB_MENU_13:
              this.viewDepartmentBudget(menuOptions);
              break;
              case BACK_MENU:
                this.presentMainMenu();
                break;
                case EXIT_MENU:
            process.exit();
        }

      });
  }
  // selects all departments from the database and presents it to the user with the console.table library
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
  // adds department to the database and presents the user with the message
  addDepartment(menuOptions) {
    return inquirer.prompt(this.addDeptPrompts).then((answers) => {
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
  // deletes department from the database and presents the user with the message
  deleteDepartment(menuOptions) {
    return inquirer.prompt(this.deleteDeptPrompts).then((answers) => {
      const sql = "delete from department where id= (?)";
      const params = [];
      params.push(answers.deleteDeptList.id)
      this.db.promise().query(sql, params)
        .then(([rows, fields]) => {
          console.log(`Deleted ${answers.deleteDeptList.name} department from the Database`);
        }).catch((err) => {
          console.log(`>>> Error has occured in running the query: ${sql}`);
        })
        .then(() => this.presentSubMenu(menuOptions))
    })
  }



  // role methods
  // selects all roles from the database and presents it to the user with the console.table library
  viewAllRoles(menuOptions) {
    const sql = "select r.id as role_id, r.title, d.name as department, r.salary from role as r inner join department as d on r.department_id=d.id order by r.id asc";
    return this.db.promise().query(sql)
      .then(([rows, fields]) => {
        console.table(rows);
      }).catch((err) => {
        console.log(`>>> Error has occured in running the query: ${sql}`);
      })
      .then(() => this.presentSubMenu(menuOptions))
  }
  // adds roles to the database and presents the user with the message
  addRole(menuOptions) {
    return inquirer.prompt(this.addRolePrompts).then((answers) => {
      const sql = "insert into role(title, salary, department_id) values (?, ?, ?)";
      const params = [];
      params.push(answers.newRoleTitle);
      params.push(answers.newRoleSalary);
      params.push(answers.newRoleDepartment.id)
      this.db.promise().query(sql, params)
        .then(([rows, fields]) => {
          console.log(`Added ${answers.newRoleTitle} role for ${answers.newRoleDepartment.name} department to the Database`);
        }).catch((err) => {
          console.log(`>>> Error has occured in running the query: ${sql}`);
        })
        .then(() => this.presentSubMenu(menuOptions))
    })

  }
  // deletes role from the database and presents the user with the message
  deleteRole(menuOptions) {
    return inquirer.prompt(this.deleteRolePrompts).then((answers) => {
      const sql = "delete from role where id= (?)";
      const params = [];
      params.push(answers.deleteRoleList.id)
      this.db.promise().query(sql, params)
        .then(([rows, fields]) => {
          console.log(`Deleted \x1b[42m${answers.deleteRoleList.title}\x1b[0m role from the Database`);
        }).catch((err) => {
          console.log(`>>> Error has occured in running the query: ${sql}`);
        })
        .then(() => this.presentSubMenu(menuOptions))
    })
  }



  // employee methods
  // selects all employees from the database and presents it to the user with the console.table library
  viewAllEmployeesById(menuOptions) {
    const sql = `select e.id, e.first_name, e.last_name, r.title, d.name as department, r.salary, concat(m.first_name, " ", m.last_name) as manager from employee as e left join role as r on e.role_id = r.id left join department as d on r.department_id = d.id left join employee as m on e.manager_id = m.id order by e.id asc;`;
    return this.db.promise().query(sql)
      .then(([rows, fields]) => {
        console.table(rows);
      }).catch((err) => {
        console.log(`>>> Error has occured in running the query: ${sql}`);
      })
      .then(() => this.presentSubMenu(menuOptions))
  }
  // grouping by manager
  viewAllEmployeesByManager(menuOptions) {
    const sql = `select concat(m.first_name, " ", m.last_name) as manager, concat(e.first_name, " ", e.last_name) as employee, r.title, d.name as department, r.salary from employee as e left join role as r on e.role_id = r.id left join department as d on r.department_id = d.id left join employee as m on e.manager_id = m.id order by m.id asc;`;
    return this.db.promise().query(sql)
      .then(([rows, fields]) => {
        console.table(rows);
      }).catch((err) => {
        console.log(`>>> Error has occured in running the query: ${sql}`);
      })
      .then(() => this.presentSubMenu(menuOptions))
  }
  // grouping by department
  viewAllEmployeesByDepartment(menuOptions) {
    const sql = `select d.name as department, concat(e.first_name, " ", e.last_name) as employee, r.title,  r.salary, concat(m.first_name, " ", m.last_name) as manager from employee as e left join role as r on e.role_id = r.id left join department as d on r.department_id = d.id left join employee as m on e.manager_id = m.id order by d.id asc;`;
    return this.db.promise().query(sql)
      .then(([rows, fields]) => {
        console.table(rows);
      }).catch((err) => {
        console.log(`>>> Error has occured in running the query: ${sql}`);
      })
      .then(() => this.presentSubMenu(menuOptions))
  }
  // budget by department
  viewDepartmentBudget(menuOptions) {
    const sql = `select d.name as department, sum(r.salary) as budget from employee as e left join role as r on e.role_id = r.id left join department as d on r.department_id = d.id left join employee as m on e.manager_id = m.id group by d.id order by d.id asc;`;
    return this.db.promise().query(sql)
      .then(([rows, fields]) => {
        console.table(rows);
      }).catch((err) => {
        console.log(`>>> Error has occured in running the query: ${sql}`);
      })
      .then(() => this.presentSubMenu(menuOptions))
  }
  // adds employees to the database and presents the user with the message
  addEmployee(menuOptions) {
    return inquirer.prompt(this.addEmplPrompts).then((answers) => {
      const sql = "insert into employee(first_name, last_name, role_id, manager_id) values (?, ?, ?, ?)";
      const params = [];
      params.push(answers.newEmplFirstName);
      params.push(answers.newEmplLastName);
      params.push(answers.newEmplRole.id);
      params.push(answers.newEmplManager.id);
      this.db.promise().query(sql, params)
        .then(([rows, fields]) => {
          console.log(`Added ${answers.newEmplFirstName} as an employee in the role of ${answers.newEmplRole.title} with ${answers.newEmplManager.name} ${((answers.newEmplManager.id === null) ? `` : `as manager `)}to the Database`);
        }).catch((err) => {
          console.log(`>>> Error has occured in running the query: ${sql}`);
        })
        .then(() => this.presentSubMenu(menuOptions))
    })

  }
  // deletes employee from the database and presents the user with the message
  deleteEmployee(menuOptions) {
    return inquirer.prompt(this.deleteEmplPrompts).then((answers) => {
      const sql = "delete from employee where id= (?)";
      const params = [];
      params.push(answers.deleteEmplList.id)
      this.db.promise().query(sql, params)
        .then(([rows, fields]) => {
          console.log(`Deleted \x1b[42m${answers.deleteEmplList.name}\x1b[0m role from the Database`);
        }).catch((err) => {
          console.log(`>>> Error has occured in running the query: ${sql}`);
        })
        .then(() => this.presentSubMenu(menuOptions))
    })
  }
  // update employee
  updateEmployeeInfo(menuOptions) {
    return inquirer.prompt(this.updateEmplInfoPrompts).then((answers) => {
      let sql = "";
      const params = [];
      if (updateEmployeeName) {
        sql = "update employee set first_name=?, last_name=? where id= (?)";
        params.push(answers.updateEmplFirstName);
        params.push(answers.updateEmplLastName);
      }
      if (updateEmployeeRole) {
        sql = "update employee set role_id=? where id= (?)";
        params.push(answers.updateEmplRole.id);
      }
      if (updateEmployeeManager) {
        sql = "update employee set manager_id=? where id= (?)";
        params.push(answers.updateEmplManager.id);
      }
      params.push(answers.updateEmpl.id);
      this.db.promise().query(sql, params)
        .then(([rows, fields]) => {
          console.log(`Updated \x1b[42m${answers.updateEmpl.name}\x1b[0m information in the Database`);
        }).catch((err) => {
          console.log(`>>> Error has occured in running the query: ${sql}`);
        })
        .then(() => {
          this.presentSubMenu(menuOptions)
          updateEmployeeName = false;
          updateEmployeeRole = false;
          updateEmployeeManager = false;
        })
    })
  }


  // helper functions
  // gets the listing of departments and presents it to the user as `choices` in a list input.
  // formatted in the way [{ name: name_from_db, value: {name: name_from_db, id: id_from_database}}]
  // that way the methods can have both the name and ID and perform their manipulations 
  getDepartmentChoices() {
    const sql = "select name, id from department";
    const options = [];
    return this.db.promise().query(sql).then(([rows, fields]) => {
      rows.forEach(row => {
        options.push({
          name: row.name,
          value: {
            name: row.name,
            id: row.id
          }
        });

      });
      return options;
    })
  }
  // gets the listing of roles and presents it to the user as `choices` in a list input.
  // formatted in the way [{ name: name_from_db, value: {name: name_from_db, id: id_from_database}}]
  // that way the methods can have both the name and ID and perform their manipulations 
  getRoleChoices() {
    const sql = "select title, id from role";
    const options = [];
    return this.db.promise().query(sql).then(([rows, fields]) => {
      rows.forEach(row => {
        options.push({
          name: row.title,
          value: {
            title: row.title,
            id: row.id
          }
        });

      });
      return options;
    })
  }
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

module.exports = CLI;
