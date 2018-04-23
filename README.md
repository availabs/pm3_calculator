# Database credentials

* The single source of truth for db credentials should be `config/postgres.env`.
* The python script `utils/connection_data.py` now
  parses this file and exports a Psycopg config object.
* To switch between local development and production databases,
  it is helpful to use a softlink named `config/postgres.env` that points
  to either a `postgres.env.local` or a `postgres.env.prod`


