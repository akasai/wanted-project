FROM mysql:latest

LABEL authors="akasai"

# change cli char-set
RUN echo "[client]\ndefault-character-set=utf8mb4\n" >> /etc/mysql/my.cnt

# dump file copy
COPY migrations.sql /sql/

# data migration
COPY scripts/*.sh /docker-entrypoint-initdb.d/
