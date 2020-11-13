drop database agendapos;
CREATE DATABASE IF NOT EXISTS agendapos;
USE agendapos;

-- DROP TABLE IF EXISTS perfil;
CREATE TABLE perfil (
  id int NOT NULL AUTO_INCREMENT,
  nome varchar(50) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY nome_UN (nome)
);


INSERT INTO perfil (nome) VALUES ('ADMINISTRADOR'), ('COMUM');

-- DROP TABLE IF EXISTS usuario;
CREATE TABLE usuario (
  id int NOT NULL AUTO_INCREMENT,
  login varchar(100) NOT NULL,
  nome varchar(100) NOT NULL,
  idperfil int NOT NULL,
  senha varchar(100) NOT NULL,
  token char(32) DEFAULT NULL,
  criacao datetime NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY login_UN (login),
  KEY idperfil_FK_idx (idperfil),
  CONSTRAINT idperfil_FK FOREIGN KEY (idperfil) REFERENCES perfil (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

INSERT INTO usuario (login, nome, idperfil, senha, token, criacao) VALUES ('ADMIN', 'ADMINISTRADOR', 1, 'peTcC99vkvvLqGQL7mdhGuJZIvL2iMEqvCNvZw3475PJ:JVyo1Pg2HyDyw9aSOd3gNPT30KdEyiUYCjs7RUzSoYGN', NULL, NOW());


CREATE TABLE evento (
  id_evento int NOT NULL AUTO_INCREMENT,
  nome_evento varchar(50) NOT NULL,
  desc_evento varchar(50) not null,
  inicio_evento datetime NOT NULL,
  termino_evento datetime NOT NULL,
  PRIMARY KEY (id_evento),
  KEY evento_inicio_termino_ix (inicio_evento, termino_evento),
  KEY evento_termino_ix (termino_evento)
);


create table sala(
	id_sala int primary key auto_increment,
    desc_sala varchar(45),
    andar_sala int
);

create table evento_sala(
	id_evento int not null,
    foreign key(id_evento) references evento(id_evento),
    id_sala int not null,
    foreign key(id_sala) references sala(id_sala),
    primary key (id_evento, id_sala)
);

create table professor(
	id_prof int primary key auto_increment,
    nome_prof varchar(45)
);

create table evento_prof(
	id_prof int not null, 
	foreign key(id_prof) references professor(id_prof),
    id_evento int not null,
    foreign key(id_evento) references evento(id_evento),
    primary key (id_prof, id_evento)
);


create table turma(
	id_turma int primary key auto_increment, 
    desc_turma varchar(45)
);

create table evento_turma(
	id_evento int not null,
    foreign key(id_evento) references evento(id_evento),
    id_turma int not null,
    foreign key(id_turma) references turma(id_turma),
    primary key (id_evento, id_turma)
);

-- COMENTÁRIO AQUI



 insert into evento(nome_evento, desc_evento, inicio_evento, termino_evento) values
 ('ev1', 'Descrição resumida do evento' ,'2020-10-02T08:00', '2020-10-02T09:00'),
 ('ev2', 'Descrição resumida do evento' , '2020-10-02T08:00', '2020-10-02T09:00'),
 ('ev3', 'Descrição resumida do evento' , '2020-10-02T10:00', '2020-10-02T09:00');

 insert into evento(nome_evento, desc_evento, inicio_evento, termino_evento) values
 ('ev1', 'Descrição resumida do evento' ,'2020-10-02T08:00', '2020-10-02T09:00');
 insert into evento_prof(id_prof, id_evento) values (1, 1);
 insert into evento_turma(id_evento, id_turma) values(1, 1);
 insert into evento_sala(id_evento, id_sala) values(1,1);

select * from evento;