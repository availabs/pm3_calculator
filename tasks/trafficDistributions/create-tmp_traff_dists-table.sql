BEGIN;

DROP TABLE IF EXISTS tmp_traff_dists;

CREATE TABLE tmp_traff_dists AS
  SELECT
      sub_qtrhr_dists.*,
      ((96 * dow) + qrthr_bin) AS bin,
      (
        day
        ||
        ' '
        ||
        to_char(
          (
            LPAD((qrthr_bin / 4)::TEXT, 2, '0')  --Hour of day
            ||
            ':'
            ||
            LPAD(((qrthr_bin % 4) * 15)::TEXT, 2, '0') -- Minute of hour
          )::TIME,
         'HH:MI AM'
        )
      ) AS tstamp,
      ('FREEWAY'::traffic_dist_functional_class_type = functional_class) AS is_interstate,
      (
        CASE
          WHEN (dow = 0) THEN 0.8::NUMERIC
          WHEN (dow BETWEEN 1 and 4) THEN 1.05::NUMERIC
          WHEN (dow = 5) THEN 1.1::NUMERIC
          WHEN (dow = 6) THEN 0.9::NUMERIC
        END
      )::NUMERIC AS dow_adj_factor
    FROM (
      SELECT
          day_type,
          congestion_level,
          directionality,
          functional_class,
          (epoch / 3) AS qrthr_bin,
          SUM(percent_daily_volume::NUMERIC / 100.0::NUMERIC) AS percent_daily_volume
        FROM traffic_distributions
        GROUP BY day_type, congestion_level, directionality, functional_class, qrthr_bin
    ) AS sub_qtrhr_dists INNER JOIN (
      SELECT
          'Sun' AS day,
          0 AS dow,
          'WEEKEND'::traffic_dist_day_type AS day_type
      UNION
      SELECT
          'Mon' AS day,
          1 AS dow,
          'WEEKDAY'::traffic_dist_day_type AS day_type
      UNION
      SELECT
          'Tue' AS day,
          2 AS dow,
          'WEEKDAY'::traffic_dist_day_type AS day_type
      UNION
      SELECT
          'Wed' AS day,
          3 AS dow,
          'WEEKDAY'::traffic_dist_day_type AS day_type
      UNION
      SELECT
          'Thu' AS day,
          4 AS dow,
          'WEEKDAY'::traffic_dist_day_type AS day_type
      UNION
      SELECT
          'Fri' AS day,
          5 AS dow,
          'WEEKDAY'::traffic_dist_day_type AS day_type
      UNION
      SELECT
          'Sat' AS day,
          6 AS dow,
          'WEEKEND'::traffic_dist_day_type AS day_type
    ) AS sub_day_literals USING (day_type)
;

COMMIT;
