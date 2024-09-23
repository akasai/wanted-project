#!/bin/bash
set +e

mysql -u$MYSQL_USER -p$MYSQL_USER_PASSWORD $MYSQL_DATABASE < /sql/migrations.sql || :
