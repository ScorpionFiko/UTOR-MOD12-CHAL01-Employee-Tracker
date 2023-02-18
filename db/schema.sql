drop database if exists employeetracker_db;
create database employeetracker_db;

use employeetracker_db;

create table department (
    `id` int not null auto_increment primary key,
    `name` varchar(30) not null
);

create table role (
    `id` int not null auto_increment primary key,
    `title` varchar(30) not null,
    `salary` decimal(13,2) not null,
    `department_id` int null,
    foreign key (`department_id`) references department(`id`) on delete set null
);

create table employee (
    `id` int not null auto_increment primary key,
    `first_name` varchar(30) not null,
    `last_name` varchar(30) not null,
    `role_id` int null,
    `manager_id` int null,
    foreign key (`role_id`) references role(`id`) on delete set null,
    foreign key (`manager_id`) references employee(`id`) on delete set null

);