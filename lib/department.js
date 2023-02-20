const CLI = require('./cli.js');
const DB = require('./db.js');
const inquirer = require('inquirer');

const SUB_MENU_10 = 10;
const SUB_MENU_11 = 11;
const SUB_MENU_12 = 12;
const SUB_MENU_13 = 13;
const SUB_MENU_14 = 14;
const EXIT_MENU = 999;
const BACK_MENU = 998;

class Department {
    constructor(cli) {
        this.cli = cli;
        this.add = false;
        this.update = false;
        this.delete = false;
        this.db = new DB().connectToDb();

        this.deptMenuPrompts = [
            {
                type: 'list',
                message: `\x1b[46mDepartment Command Menu\x1b[0m\nWhat would you like to do?`,
                name: 'subMenuCommand',
                choices: [
                    { name: `View all departments`, value: SUB_MENU_10 },
                    { name: `View the total utilized budget of a department`, value: SUB_MENU_13 },
                    { name: "Add a department", value: SUB_MENU_11 },
                    { name: "Update a department", value: SUB_MENU_14 },
                    { name: "Delete a department", value: SUB_MENU_12 },
                    { name: "Back to Main Menu", value: BACK_MENU },
                    { name: "Exit Application", value: EXIT_MENU }
                ]
            }
        ];
        this.deptInfoPrompts = [
            {
              type: 'list',
              message: () => {return `Select which department to ${((this.update) ? `update`: `delete`)}`},
              name: 'deptList',
              choices: async () => await this.getDepartmentChoices(),
              when: () => {
                return (this.update || this.delete);
              }
            },
            {
              type: 'input',
              message: `Enter ${((this.add) ? ``: `a new `)}department name:`,
              name: 'deptName',
              when: () => {
                return (this.add || this.update);
              }
            }
          ];
    }

    // selects all departments from the database and presents it to the user with the console.table library
    viewAllDepartments() {
        const sql = "select * from department";
        return this.db.promise().query(sql)
            .then(([rows, fields]) => {
                console.table(rows);
            }).catch((err) => {
                console.log(`>>> Error has occured in running the query: ${sql}\n`);
            })
            .then(() => this.presentSubMenu())
    }
    updateDepartment() {
        return inquirer.prompt(this.deptInfoPrompts).then((answers) => {

            const sql = "update department set name=? where id=?";
            const params = [];
            params.push(answers.deptName);
            params.push(answers.deptList.id)
            return this.db.promise().query(sql, params)
                .then(([rows, fields]) => {
                    console.log(`Updated \x1b[42m${answers.deptList.name}\x1b[0m information in the Database\n`);
                }).catch((err) => {
                    console.log(`>>> Error has occured in running the query: ${sql}`);
                })
                .then(() => {
                    this.resetFlags();
                    this.presentSubMenu();
                })
        });
    }
    // adds department to the database and presents the user with the message
    addDepartment() {
        return inquirer.prompt(this.deptInfoPrompts).then((answers) => {
            const sql = "insert into department(name) values (?)";
            const params = [];
            params.push(answers.deptName)
            this.db.promise().query(sql, params)
                .then(([rows, fields]) => {
                    console.log(`Added \x1b[42m${answers.deptName}\x1b[0m to the Database\n`);
                }).catch((err) => {
                    console.log(`>>> Error has occured in running the query: ${sql}`);
                })
                .then(() => { 
                    this.resetFlags();
                    this.presentSubMenu();
                })
        })

    }
    // deletes department from the database and presents the user with the message
    deleteDepartment() {
        return inquirer.prompt(this.deptInfoPrompts).then((answers) => {
            const sql = "delete from department where id= (?)";
            const params = [];
            params.push(answers.deptList.id)
            this.db.promise().query(sql, params)
                .then(([rows, fields]) => {
                    console.log(`Deleted \x1b[42m${answers.deptList.name}\x1b[0m department from the Database\n`);
                }).catch((err) => {
                    console.log(`>>> Error has occured in running the query: ${sql}`);
                })
                .then(() => {
                    this.resetFlags();
                    this.presentSubMenu();
                })
        })
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

    resetFlags() {
        this.add=false;
        this.delete=false;
        this.update=false;
    }

    presentSubMenu() {
        return inquirer
            .prompt(this.deptMenuPrompts)
            .then((answers) => {
                switch (answers.subMenuCommand) {
                    // department menus
                    case SUB_MENU_10:
                        this.viewAllDepartments();
                        break;
                    case SUB_MENU_11:
                        this.add=true;
                        this.addDepartment();
                        break;
                    case SUB_MENU_12:
                        this.delete=true;
                        this.deleteDepartment();
                        break;
                    case SUB_MENU_13:
                        this.viewDepartmentBudget();
                        break;
                    case SUB_MENU_14:
                        this.update=true;
                        this.updateDepartment();
                        break;
                    case BACK_MENU:
                        this.cli.presentMainMenu();
                        break;
                    case EXIT_MENU:
                        process.exit();
                }

            });
    }


      // helper functions
  // gets the listing of departments and presents it to the user as `choices` in a list input.
  // formatted in the way [{ name: name_from_db, value: {name: name_from_db, id: id_from_database}}]
  // that way the methods can have both the name and ID and perform their manipulations 
  async getDepartmentChoices() {
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

}

module.exports = Department;