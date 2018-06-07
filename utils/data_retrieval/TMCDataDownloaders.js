const db_service = require('../db_service');
const db_service_here = require('../db_service_here');

const buildSQL = (tmc, year, state) => `
  SELECT
      npmrds_date("date") as npmrds_date, 
      epoch, 
      travel_time_all_vehicles,
      travel_time_passenger_vehicles,
      travel_time_freight_trucks
    FROM "${state}".npmrds 
    WHERE (
      (tmc = '${tmc}')
      AND 
      (date >= '${year}-01-01'::DATE AND date < '${year + 1}-01-01'::DATE)
    );
`;

const Downloader = dbSvc => (tmc, year, state) =>
  new Promise((resolve, reject) => {
    const sql = buildSQL(tmc, year, state);

    dbSvc.runQuery(sql, [], (err, data) => {
      if (err) {
        return reject(err);
      }

      return resolve(data);
    });
  });

const DownloadTMCData = Downloader(db_service);
const DownloadTMCDataHERE = Downloader(db_service_here);

module.exports = {
  DownloadTMCData,
  DownloadTMCDataHERE
};
