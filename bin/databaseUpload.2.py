#!/usr/bin/env python

import psycopg2, time, json, os, argparse
from connection_data import ConnectionData

STATE = os.getenv('STATE')
YEAR = os.getenv('YEAR')
TABLE_NAME = os.getenv('TABLE_NAME', 'pm3')

def loadAnnotations(filename) :
    if os.path.exists(filename):
        return json.load(open(filename))
    else:
        print("No annotation file {} found".format(filename))

def loadFields(filename) :
    if os.path.exists(filename):
        fields = []
        with open(filename) as f:
            header = f.readline()
            fields = header.split(',')
        return fields
    else:
        print("No field file {} found".format(filename))

def getConnection(connectionData):
    connection = None

    try:
        connection = psycopg2.connect(**connectionData)
    except Exception as e:
        print ("Could not establish connection with {}." \
               .format(connectionData['database']))

    if connection:
        print ("Established Connection with {}." \
               .format(connectionData['database']))

    return connection

def buildFields (fields, meta) :
    return ["{} {}".format(field, meta[field] if field in meta else 'numeric') \
            for field in fields]

def init_table(connection, state, year, parent, table_name ) :
    with connection.cursor() as cursor:
        sql = """
        CREATE SCHEMA IF NOT EXISTS "{}";
        DROP TABLE IF EXISTS {};
        CREATE TABLE {} (check(_state_='{}' and _year_={})) INHERITS ({});

        """
        statement = sql.format(state, table_name, table_name, state, year, parent)
        print(statement)
        cursor.execute(statement)
    connection.commit()

def init_root(connection, root, fields) :
    with connection.cursor() as cursor:
        sql = """
        CREATE TABLE IF NOT EXISTS {}
        ({}, _state_ char(2), _year_ smallint)"""
        statement = sql.format(root, ','.join(fields))
        print(statement)
        cursor.execute(statement)
    connection.commit()

def init_state(connection, root, state) :
    with connection.cursor() as cursor:
        sql="""
        CREATE SCHEMA IF NOT EXISTS "{}";
        CREATE TABLE IF NOT EXISTS "{}".{} (CHECK (_state_='{}')) INHERITS ({})
        """
        statement = sql.format(state, state, root, state, root)
        print (statement)
        cursor.execute(statement)
    connection.commit()

def init_parser () :
    parser = argparse.ArgumentParser(description= \
                                     'Creates a table for the csv based on an annotation file')
    parser.add_argument('--meta', type=str, required=True, \
                        help='Enter the name of the annotation file')
    parser.add_argument('--csv' , type=str, required=True, \
                        help='Enter the name of the csv file to create from')
    return parser.parse_args()

def main() :
    args = init_parser()
    meta = loadAnnotations(args.meta)
    if not meta:
        return
    fields = loadFields(args.csv)
    if not fields:
        return
    fieldSpecs = buildFields(fields,meta)
    if len(fieldSpecs) > 0:
        if (STATE is None) or (YEAR is None):
            state, year = tuple(map(lambda x: x.lower(), os.path.basename(args.csv).split('_')[0:2]))
        else:
            state = STATE
            year = YEAR

        table_name= '"{}".{}_{}'.format(state, TABLE_NAME, year)
        connection = getConnection(ConnectionData)
        root = TABLE_NAME
        parent = '"{}".{}'.format(state, TABLE_NAME)
        init_root(connection, root, fieldSpecs)
        init_state(connection, root, state)
        init_table(connection, state, year, parent,  table_name)
        connection.close()

if __name__ == '__main__':
    main()
