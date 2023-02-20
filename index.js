const CLI = require('./lib/cli');
const DB = require('./lib/db');


const cli = new CLI();
const db = new DB(cli).connectToDb();

