#!/bin/bash
set -e

mysql -u root -p"$MYSQL_ROOT_PASSWORD" <<-EOSQL
  CREATE DATABASE IF NOT EXISTS $MYSQL_DATABASE;            -- 데이터베이스 생성 (존재하지 않을 경우만)
  CREATE USER IF NOT EXISTS '$MYSQL_USER'@'%' IDENTIFIED BY '$MYSQL_USER_PASSWORD';  -- 사용자 생성 (존재하지 않을 경우만)
  GRANT ALL PRIVILEGES ON $MYSQL_DATABASE.* TO '$MYSQL_USER'@'%';  -- 권한 부여
  FLUSH PRIVILEGES;                                             -- 권한 적용
EOSQL
