SELECT
  'ny'::VARCHAR(2) AS state,
  tmc::VARCHAR(9),
  __YEAR__::SMALLINT AS year,
  JSONB_OBJECT_AGG (
    time_period,
    percentiles
  ) AS data
 FROM (
  SELECT
     tmc,
     CASE WHEN (EXTRACT(DOW from date) BETWEEN 1 AND 5) THEN
       CASE WHEN (fifteen_min_bin BETWEEN 24 AND 39) THEN 'AM_PEAK'
         WHEN (fifteen_min_bin BETWEEN 40 AND 63) THEN 'MIDDAY'
         ELSE 'PM_PEAK'
       END
       ELSE 'WEEKEND'
     END AS time_period,
     PERCENTILE_DISC(array[0.50, 0.80])
       WITHIN GROUP (ORDER BY avg_travel_time) AS percentiles
   FROM (
     SELECT
         tmc,
         date,
         (epoch / 3) AS fifteen_min_bin,
         ROUND(AVG(travel_time_all_vehicles)) AS avg_travel_time
       FROM "__STATE__".npmrds
       WHERE
         tmc = '120P04340'
         (date >= '2017-1-1'::DATE) AND (date < '2018-1-1'::DATE)
         AND (epoch BETWEEN 72 AND 239) -- between is inclusive
       GROUP BY tmc, state, date, fifteen_min_bin
     ) AS averages
   GROUP BY tmc, time_period  
  ) AS percentiles
GROUP BY tmc
