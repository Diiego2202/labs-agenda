drop database agendapos;
CREATE DATABASE IF NOT EXISTS agendapos;
USE agendapos;

CREATE TABLE perfil (
  id int NOT NULL AUTO_INCREMENT,
  nome varchar(50) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY nome_UN (nome)
);


INSERT INTO perfil (nome) VALUES ('Administrador'), ('Comum');

CREATE TABLE usuario (
  id int NOT NULL AUTO_INCREMENT,
  login varchar(100) NOT NULL,
  nome varchar(100) NOT NULL,
  email varchar(100) NOT NULL,
  idperfil int NOT NULL,
  token char(32) DEFAULT NULL,
  criacao datetime NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY login_UN (login),
  KEY idperfil_FK_idx (idperfil),
  CONSTRAINT idperfil_FK FOREIGN KEY (idperfil) REFERENCES perfil (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

INSERT INTO usuario (login, nome, email, idperfil, criacao) VALUES
('admin', 'admin', 'admin@mail.com', 1, NOW()),
('julia.rolemberg', 'Julia Rolemberg', 'julia@mail.com', 1, NOW()),
('pedro.heck', 'Pedro Heck', 'pedro@mail.com', 1, NOW());

CREATE TABLE aula (
  id_aula int NOT NULL AUTO_INCREMENT,
  nome_aula varchar(100) NOT NULL,
  desc_aula varchar(100) NOT NULL,
  inicio_aula datetime NOT NULL,
  termino_aula datetime NOT NULL,
  carga_horaria int NOT NULL,
  PRIMARY KEY (id_aula),
  KEY aula_inicio_termino_ix (inicio_aula, termino_aula),
  KEY aula_termino_ix (termino_aula)
);

CREATE TABLE aula_ocorrencia (
  id_ocorrencia int NOT NULL AUTO_INCREMENT,
  id_aula int NOT NULL,
  inicio_ocorrencia datetime NOT NULL,
  PRIMARY KEY (id_ocorrencia),
  KEY aula_ocorrencia_id_aula_ix (id_aula, inicio_ocorrencia),
  KEY aula_ocorrencia_inicio_ocorrencia_ix (inicio_ocorrencia),
  foreign key(id_aula) references aula(id_aula) on delete cascade on update restrict
);

create table sala(
	id_sala int primary key auto_increment,
    desc_sala varchar(45),
    andar_sala int
);

create table aula_sala(
	id_aula int not null,
    foreign key(id_aula) references aula(id_aula),
    id_sala int not null,
    foreign key(id_sala) references sala(id_sala),
    primary key (id_aula, id_sala),
    KEY aula_sala_id_sala_ix (id_sala)
);

create table professor(
	id_prof int primary key auto_increment,
    nome_prof varchar(45)
);

create table aula_prof(
	id_prof int not null, 
	foreign key(id_prof) references professor(id_prof),
    id_aula int not null,
    foreign key(id_aula) references aula(id_aula),
    primary key (id_prof, id_aula),
    KEY aula_prof_id_aula_ix (id_aula)
);

create table turma(
	id_turma int primary key auto_increment, 
    desc_turma varchar(45)

);

create table aula_turma(
	id_aula int not null,
    foreign key(id_aula) references aula(id_aula),
    id_turma int not null,
    foreign key(id_turma) references turma(id_turma),
    primary key (id_aula, id_turma),
    KEY aula_turma_id_turma_ix (id_turma)
);

CREATE TABLE `agendapos`.`calendario` (
  `id_calendario` INT NOT NULL auto_increment,
  `id_turma` INT NOT NULL,
  `url_calendario` varchar(200) NOT NULL,
  PRIMARY KEY (`id_calendario`),
  INDEX `id_turma_FK_idx` (`id_turma` ASC) VISIBLE,
  CONSTRAINT `id_turma_FK`
    FOREIGN KEY (`id_turma`)
    REFERENCES `agendapos`.`turma` (`id_turma`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

CREATE TABLE `agendapos`.`aluno` (
  `id_aluno` INT NOT NULL auto_increment,
  `nome_aluno` VARCHAR(45) NOT NULL,
  `email_aluno` VARCHAR(100) NOT NULL,
  `RA_aluno` DECIMAL(10) NOT NULL,
  `id_turma`int NOT NULL,
  PRIMARY KEY (`id_aluno`),
INDEX `id_turma_FK_idx` (`id_turma` ASC) VISIBLE,
  CONSTRAINT `id_turma_FK2`
    FOREIGN KEY (`id_turma`)
    REFERENCES `agendapos`.`turma` (`id_turma`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

insert into aula(nome_aula, desc_aula, inicio_aula, termino_aula, carga_horaria) values
('aula1', 'Descrição resumida do aula' , '2021-04-01T08:00', '2021-04-01T09:00', 4),
('aula2', 'Descrição resumida do aula' , '2021-04-01T08:00', '2021-04-01T09:00', 4),
('aula3', 'Descrição resumida do aula' , '2021-04-01T08:00', '2021-04-01T09:00', 4),
('aula4', 'Descrição resumida da aula' , '2021-04-01T08:00', '2021-04-01T09:00', 4);

insert into professor(nome_prof) values ('Professor 1'), ('Professor 2'), ('Professor 3'), ('Professor 4');
insert into turma(desc_turma) values ('Turma 1'), ('Turma 2'), ('Turma 3'), ('Turma 4');
insert into sala(desc_sala, andar_sala) values ('Sala 1', 1), ('Sala 2', 2), ('Sala 3', 3), ('Sala 4', 4);
insert into aula_prof(id_prof, id_aula) values (1, 1), (2,2), (3,3), (4,4);
insert into aula_turma(id_aula, id_turma) values (1, 1), (2,2), (3,3), (4,4);
insert into aula_sala(id_aula, id_sala) values (1,1), (2,2), (3,3), (4,4);
