# /usr/bin/python
import psycopg2, time, json, os, argparse
from connection_data import ConnectionData

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

def init_table(connection, table_name, fields ) :
    with connection.cursor() as cursor:
        sql = """
        DROP TABLE IF EXISTS {};
        CREATE TABLE {} ({});
        """
        statement = sql.format(table_name,table_name, ','.join(fields))
        print(statement)
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
    print ('hi')
    meta = loadAnnotations(args.meta)
    if not meta:
        return
    fields = loadFields(args.csv)
    if not fields:
        return
    fieldSpecs = buildFields(fields,meta)
    if len(fieldSpecs) > 0:
        state,year= tuple(map(lambda x: x.lower(), os.path.basename(args.csv).split('_')[0:2]))
        table_name= '{}.pm3_{}'.format(state,year)
        connection = getConnection(ConnectionData)
        init_table(connection, table_name, fieldSpecs)
        connection.close()

if __name__ == '__main__':
    main()
