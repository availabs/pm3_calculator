#! /usr/bin/env python

#  PGDATABASE
#  PGUSER
#  PGPASSWORD
#  PGHOST
#  PGPORT
import os

this_dir = os.path.dirname(os.path.abspath(__file__))
config_path = os.path.join(this_dir, '../config/postgres.env')

dbConfig = {}

# Read the config file and build the dbConfig dict
with open(config_path, 'r') as f:
    for line in f:
        if "=" in line:
            (key, _, value) = line.partition("=")
            dbConfig[key.strip()] = value.strip()

# From psql env vars to their psycopg equivalents
ConnectionData = {
  "database": dbConfig.get("PGDATABASE", None),
  "user": dbConfig.get("PGUSER", None),
  "password": dbConfig.get("PGPASSWORD", None),
  "host": dbConfig.get("PGHOST", None),
  "port": dbConfig.get("PGPORT", None)
}
