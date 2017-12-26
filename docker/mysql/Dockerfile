#FROM mariadb:10.1
FROM mysql:5.7

# COPY ./schema.sql /docker-entrypoint-initdb.d/schema.sql

ENV MYSQL_ROOT_PASSWORD root-secret-pw
ENV MYSQL_DATABASE mydb
ENV MYSQL_USER admin
ENV MYSQL_PASSWORD my-secret-pw

EXPOSE 3306
