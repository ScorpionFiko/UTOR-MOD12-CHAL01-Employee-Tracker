insert into department(`name`) values ('Sales'), ('Research'), ('Human Resources');

insert into role(`title`, `salary`, `department_id`) values 
('specialist', 30000,1),
('branch manager', 60000,1),
('regional manager', 90000,1),
('analyst II', 35000,2),
('analyst III', 45000, 2),
('analyst IV', 55000, 2),
('analyst V', 65000,2),
('generalist', 45000, 3),
('councel', 100000, 3);

insert into employee(`first_name`, `last_name`, `role_id`) values 
('Yuuka','Kaneko', 8),
('Shanae', 'Abner', 1),
('Oualid','Solomiya', 2),
('Tatenda', 'Iyabo', 1),
('Tomislav','Sanada', 6),
('Ioan', 'Zornitsa', 1),
('Makara','Kawasaki', 5),
('Shadya','Ognianov', 8),
('Junko','Kurō', 1),
('Sawsan','Sano', 5),
('Rauf','Yara', 1),
('Ziya', 'ad-Din Iseul', 2),
('Nadira','Furnadjiev', 4),
('Irfan','Nishitani', 9),
('Tsubame','Sherazi', 7),
('Husayn','Higashi', 4),
('Harumi','Bousaid', 6),
('Ivet','Yamasaki', 5),
('Nour','Zhivkov', 4),
('Kōji','Asanuma', 4),
('Naila','Uchimura', 8),
('Haika','Larka', 3);

select * from department;
select * from role;
select * from employee;