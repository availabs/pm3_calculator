pass=***REMOVED***
user=npmrds_ninja
db=npmrds_test
host=ares.availabs.org

FIELDS=$(head -n 1 ${1})
FILENAME=$(basename $1)
STATE=${FILENAME%%_*}
NOSTATE=${FILENAME#*_}
YEAR=${NOSTATE%%_*}
echo $FILENAME
COPY="\copy ${STATE}.pm3_${YEAR} (${FIELDS})  from '${1}' DELIMITER ',' CSV HEADER"
echo $COPY
python ./databaseUpload.py --csv=$1 --meta=$2

# Assume the schema exists for a state
$(PGPASSWORD=${pass} psql -qxtA -U"${user}" \
            -h"${host}" \
            -d"${db}" \
            -c "ALTER TABLE ${STATE}.pm3_${YEAR} \
             ALTER COLUMN _year_ SET DEFAULT ${YEAR}, ALTER COLUMN _state_ SET DEFAULT '${STATE}';
             CREATE INDEX ${STATE}_pm3_${YEAR}_index ON ${STATE}.pm3_${YEAR} (tmc)")

$(PGPASSWORD=${pass} psql -qxtA -U"${user}" \
            -h"${host}" \
            -d"${db}" \
            -c "${COPY}")
