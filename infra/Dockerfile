FROM mysql:latest

LABEL authors="akasai"

# copy cli char-set
COPY my.cnf /etc/mysql/

# dump file copy
COPY migrations.sql /sql/

# data migration
COPY scripts/*.sh /docker-entrypoint-initdb.d/
