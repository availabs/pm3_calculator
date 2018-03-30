pass=***REMOVED***
user=npmrds_ninja
db=npmrds_test
host=ares.availabs.org


FILENAME=$(basename $1)
STATE=${FILENAME%%_*}
NOSTATE=${FILENAME#*_}
YEAR=${NOSTATE%%_*}
echo $STATE
echo $YEAR

python ./databaseUpload.py --csv=$1 --meta=$2

# Assume the schema exists for a state
$(PGPASSWORD=${pass} psql -qxtA -U"${user}" \
            -h"${host}" \
            -d"${db}" \
            -c "\copy ${STATE}.pm3_${YEAR} from '${1}' DELIMITER ',' CSV HEADER")
