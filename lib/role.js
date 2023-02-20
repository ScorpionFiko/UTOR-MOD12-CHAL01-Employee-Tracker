const DB = require('./db.js');
const Deptartment = require('./department.js');
const inquirer = require('inquirer');
const cTable = require('console.table');

const SUB_MENU_10 = 10;
const SUB_MENU_11 = 11;
const SUB_MENU_12 = 12;
const SUB_MENU_13 = 13;
const SUB_MENU_14 = 14;
const SUB_MENU_15 = 15;
const EXIT_MENU = 999;
const BACK_MENU = 998;

class Role {
    constructor(cli) {
        this.cli = cli;
        this.add = false;
        this.updateTitle = false;
        this.updateSalary = false;
        this.updateDepartment = false;
        this.delete = false;
        this.db = new DB().dbConnection;
        this.roleMenuPrompts = [
            {
                type: 'list',
                message: () => `\x1b[46mRole Command Menu\x1b[0m\nWhat would you like to do?`,
                name: 'subMenuCommand',
                choices: [
                    { name: `View all roles`, value: SUB_MENU_10 },
                    { name: "Add a role", value: SUB_MENU_11 },
                    { name: "Update role title", value: SUB_MENU_12 },
                    { name: "Update role salary", value: SUB_MENU_13 },
                    { name: "Update role department", value: SUB_MENU_14 },
                    { name: "Delete a role", value: SUB_MENU_15 },
                    { name: "Back to Main Menu", value: BACK_MENU },
                    { name: "Exit Application", value: EXIT_MENU }
                ]
            }
        ];

        this.roleInfoPrompts = [
            {
                type: 'list',
                message: `Select the role you would like to ${((this.updateTitle || this.updateSalary || this.updateDepartment) ? `update` : `delete`)}:`,
                name: 'roleList',
                choices: async () => await this.getRoleChoices(),
                when: () => { return (this.delete || this.updateTitle || this.updateSalary || this.updateDepartment) }
            },
            {
                type: 'input',
                message: () => { return `Enter ${((this.add) ? `` : `a new `)}role title:` },
                name: 'roleTitle',
                when: () => { return (this.add || this.updateTitle) }
            },
            {
                type: 'input',
                message: `Enter ${((this.add) ? `` : `a new `)}role salary:`,
                name: 'roleSalary',
                validate: (salary) => {
                    const digitRegex = new RegExp('[+]?\\d*\\.?\\d+');
                    if (!digitRegex.test(salary)) {
                        return (`Please enter a number`);
                    } else {
                        return true;
                    }
                },
                when: () => { return (this.add || this.updateSalary) }
            },
            {
                type: 'list',
                message: `Select ${((this.add) ? `` : `a new `)}department to which this role belongs`,
                name: 'roleDepartment',
                choices: async () => await new Deptartment().getDepartmentChoices(),
                when: () => { return (this.add || this.updateDepartment) }
            }
        ];

    }

    resetFlags() {
        this.add = false;
        this.updateTitle = false;
        this.updateSalary = false;
        this.updateDepartment = false;
        this.delete = false;
    }

    presentSubMenu() {
        return inquirer
            .prompt(this.roleMenuPrompts)
            .then((answers) => {
                switch (answers.subMenuCommand) {
                    //role menus
                    case SUB_MENU_10:
                        this.viewAllRoles();
                        break;
                    case SUB_MENU_11:
                        this.add = true;
                        this.addRole();
                        break;
                    case SUB_MENU_12:
                        this.updateTitle = true;
                        this.updateRoleInfo();
                        break;
                    case SUB_MENU_13:
                        this.updateSalary = true;
                        this.updateRoleInfo();
                        break;
                    case SUB_MENU_14:
                        this.updateDepartment = true;
                        this.updateRoleInfo();
                        break;
                    case SUB_MENU_15:
                        this.delete = true
                        this.deleteRole();
                        break;
                    case BACK_MENU:
                        this.cli.presentMainMenu();
                        break;
                    case EXIT_MENU:
                        process.exit();
                }
            });
    }

    // role methods
    // selects all roles from the database and presents it to the user with the console.table library
    viewAllRoles() {
        const sql = "select r.id as role_id, r.title, d.name as department, r.salary from role as r left join department as d on r.department_id=d.id order by r.id asc";
        return this.db.promise().query(sql)
            .then(([rows, fields]) => {
                console.table(rows);
            }).catch((err) => {
                console.log(`>>> Error has occured in running the query: ${sql}\n`);
            })
            .then(() => this.presentSubMenu())
    }
    // adds roles to the database and presents the user with the message
    addRole() {
        return inquirer.prompt(this.roleInfoPrompts).then((answers) => {
            const sql = "insert into role(title, salary, department_id) values (?, ?, ?)";
            const params = [];
            params.push(answers.roleTitle);
            params.push(answers.roleSalary);
            params.push(answers.roleDepartment.id)
            this.db.promise().query(sql, params)
                .then(([rows, fields]) => {
                    console.log(`Added \x1b[42m${answers.roleTitle}\x1b[0m role for \x1b[42m${answers.roleDepartment.name}\x1b[0m department to the Database\n`);
                }).catch((err) => {
                    console.log(`>>> Error has occured in running the query: ${sql}\n`);
                })
                .then(() => {
                    this.resetFlags();
                    this.presentSubMenu()
                });
        });

    }
    // update roles
    updateRoleInfo() {
        return inquirer.prompt(this.roleInfoPrompts).then((answers) => {
            let sql = "";
            const params = [];
            if (this.updateTitle) {
                sql = "update role set title=? where id= (?)";
                params.push(answers.roleTitle);
            }
            if (this.updateSalary) {
                sql = "update role set salary=? where id= (?)";
                params.push(answers.roleSalary);
            }
            if (this.updateDepartment) {
                sql = "update role set department_id=? where id= (?)";
                params.push(answers.roleDepartment.id);
            }
            params.push(answers.roleList.id);
            this.db.promise().query(sql, params)
                .then(([rows, fields]) => {
                    console.log(`Updated \x1b[42m${answers.roleList.name}\x1b[0m information in the Database\n`);
                }).catch((err) => {
                    console.log(`>>> Error has occured in running the query: ${sql}\n`);
                })
                .then(() => {
                    this.resetFlags();
                    this.presentSubMenu();
                })
        })
    }

    // deletes role from the database and presents the user with the message
    deleteRole() {
        return inquirer.prompt(this.roleInfoPrompts).then((answers) => {
            const sql = "delete from role where id= (?)";
            const params = [];
            params.push(answers.roleList.id)
            this.db.promise().query(sql, params)
                .then(([rows, fields]) => {
                    console.log(`Deleted \x1b[42m${answers.roleList.name}\x1b[0m role from the Database\n`);
                }).catch((err) => {
                    console.log(`>>> Error has occured in running the query: ${sql}\n`);
                })
                .then(() => {
                    this.resetFlags();
                    this.presentSubMenu();
                });
        });
    }
    // helper functions
    // gets the listing of roles and presents it to the user as `choices` in a list input.
    // formatted in the way [{ name: name_from_db, value: {name: name_from_db, id: id_from_database}}]
    // that way the methods can have both the name and ID and perform their manipulations 
    async getRoleChoices() {
        const sql = "select title, id from role";
        const options = [];
        return this.db.promise().query(sql).then(([rows, fields]) => {
            rows.forEach(row => {
                options.push({
                    name: row.title,
                    value: {
                        name: row.title,
                        id: row.id
                    }
                });

            });
            return options;
        })
    }

}

module.exports = Role;