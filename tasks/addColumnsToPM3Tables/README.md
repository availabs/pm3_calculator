# Instructions

1. Use either `getGeoLevelPM3Tables.sh` or `getPM3Tables.sh`
    to create a file listing the tables requiring ALTERing.
1. Inspect the file to make sure there are no extra tables listed.
1. Create a SQL file that uses __TABLE_NAME__ as a placeholder for the table name.
1. Use either `alterPM3Tables.sh` or `alterGeoLevelPM3Tables.sh`,
    with the SQL file as the command line argument,
    to make the changes to each table in the respective list file.
