COPY (
  SELECT 
      bin,
      sub_120P04340."120P04340", 
      sub_120P04340." ",
      --  ROUND(sub_120N05397.dow_adj_factor, 3) AS "dow_adj_factor",
      sub_120N05397."120N05397", 
      sub_120N05397." ",
      --  ROUND(sub_120N05397.dow_adj_factor, 3) AS "dow_adj_factor",
      "sub_120+14882"."120+14882", 
      "sub_120+14882"." ",
      --  ROUND("sub_120+14882".dow_adj_factor, 3) AS "dow_adj_factor",
      "sub_120-07060"."120-07060", 
      "sub_120-07060"." ",
      --  ROUND("sub_120-07060".dow_adj_factor, 3) AS "dow_adj_factor",
      tstamp
    FROM (
      SELECT
          bin,
          ROUND(dow_adj_factor, 3) AS dow_adj_factor,
          ROUND(
            CASE WHEN (faciltype = 1)
              THEN dow_adj_factor::NUMERIC * aadt::NUMERIC * percent_daily_volume::NUMERIC
              ELSE dow_adj_factor::NUMERIC * aadt::NUMERIC * percent_daily_volume::NUMERIC / 2::NUMERIC
            END,
            3
          ) AS "120P04340",
          ROUND(
            dow_adj_factor::NUMERIC
            *
            percent_daily_volume::NUMERIC,
            6
          ) AS " ",
          tstamp
        FROM tmp_traff_dists
          INNER JOIN tmc_attributes USING (congestion_level, directionality, is_interstate)
        WHERE (tmc = '120P04340')
      UNION
      SELECT
          bin,
          ROUND(dow_adj_factor, 3) AS dow_adj_factor,
          ROUND(
            CASE WHEN (faciltype = 1)
              THEN dow_adj_factor::NUMERIC * aadt::NUMERIC * percent_daily_volume::NUMERIC
              ELSE dow_adj_factor::NUMERIC * aadt::NUMERIC * percent_daily_volume::NUMERIC / 2::NUMERIC
            END,
            3
          ) AS "120P04340",
          ROUND(
            dow_adj_factor::NUMERIC
            *
            percent_daily_volume::NUMERIC,
            6
          ) AS " ",
          tstamp
        FROM tmp_traff_dists
          INNER JOIN tmc_attributes USING (is_interstate)
        WHERE (
          (tmc = '120P04340')
          AND
          (day_type = 'WEEKEND'::traffic_dist_day_type)
        )
    ) AS sub_120P04340 INNER JOIN (
      SELECT
          bin,
          ROUND(dow_adj_factor, 3) AS dow_adj_factor,
          ROUND(
            CASE WHEN (faciltype = 1)
              THEN dow_adj_factor::NUMERIC * aadt::NUMERIC * percent_daily_volume::NUMERIC
              ELSE dow_adj_factor::NUMERIC * aadt::NUMERIC * percent_daily_volume::NUMERIC / 2::NUMERIC
            END,
            3
          ) AS "120N05397",
          ROUND(
            dow_adj_factor::NUMERIC
            *
            percent_daily_volume::NUMERIC,
            6
          ) AS " ",
          tstamp
        FROM tmp_traff_dists
          INNER JOIN tmc_attributes USING (congestion_level, directionality, is_interstate)
        WHERE (tmc = '120N05397')
      UNION
      SELECT
          bin,
          ROUND(dow_adj_factor, 3) AS dow_adj_factor,
          ROUND(
            CASE WHEN (faciltype = 1)
              THEN dow_adj_factor::NUMERIC * aadt::NUMERIC * percent_daily_volume::NUMERIC
              ELSE dow_adj_factor::NUMERIC * aadt::NUMERIC * percent_daily_volume::NUMERIC / 2::NUMERIC
            END,
            3
          ) AS "120N05397",
          ROUND(
            dow_adj_factor::NUMERIC
            *
            percent_daily_volume::NUMERIC,
            6
          ) AS " ",
          tstamp
        FROM tmp_traff_dists
          INNER JOIN tmc_attributes USING (is_interstate)
        WHERE (
          (tmc = '120N05397')
          AND
          (day_type = 'WEEKEND'::traffic_dist_day_type)
        )
    ) AS sub_120N05397 USING (bin, tstamp) INNER JOIN (
      SELECT
          bin,
          ROUND(dow_adj_factor, 3) AS dow_adj_factor,
          ROUND(
            CASE WHEN (faciltype = 1)
              THEN dow_adj_factor::NUMERIC * aadt::NUMERIC * percent_daily_volume::NUMERIC
              ELSE dow_adj_factor::NUMERIC * aadt::NUMERIC * percent_daily_volume::NUMERIC / 2::NUMERIC
            END,
            3
          ) AS "120+14882",
          ROUND(
            dow_adj_factor::NUMERIC
            *
            percent_daily_volume::NUMERIC,
            6
          ) AS " ",
          tstamp
        FROM tmp_traff_dists
          INNER JOIN tmc_attributes USING (congestion_level, directionality, is_interstate)
        WHERE (tmc = '120+14882')
      UNION
      SELECT
          bin,
          ROUND(dow_adj_factor, 3) AS dow_adj_factor,
          ROUND(
            CASE WHEN (faciltype = 1)
              THEN dow_adj_factor::NUMERIC * aadt::NUMERIC * percent_daily_volume::NUMERIC
              ELSE dow_adj_factor::NUMERIC * aadt::NUMERIC * percent_daily_volume::NUMERIC / 2::NUMERIC
            END,
            3
          ) AS "120+14882",
          ROUND(
            dow_adj_factor::NUMERIC
            *
            percent_daily_volume::NUMERIC,
            6
          ) AS " ",
          tstamp
        FROM tmp_traff_dists
          INNER JOIN tmc_attributes USING (is_interstate)
        WHERE (
          (tmc = '120+14882')
          AND
          (day_type = 'WEEKEND'::traffic_dist_day_type)
        )
    ) AS "sub_120+14882" USING (bin, tstamp) INNER JOIN (
      SELECT
          bin,
          ROUND(dow_adj_factor, 3) AS dow_adj_factor,
          ROUND(
            CASE WHEN (faciltype = 1)
              THEN dow_adj_factor::NUMERIC * aadt::NUMERIC * percent_daily_volume::NUMERIC
              ELSE dow_adj_factor::NUMERIC * aadt::NUMERIC * percent_daily_volume::NUMERIC / 2::NUMERIC
            END,
            3
          ) AS "120-07060",
          ROUND(
            dow_adj_factor::NUMERIC
            *
            percent_daily_volume::NUMERIC,
            6
          ) AS " ",
          tstamp
        FROM tmp_traff_dists
          INNER JOIN tmc_attributes USING (congestion_level, directionality, is_interstate)
        WHERE (tmc = '120-07060')
      UNION
      SELECT
          bin,
          ROUND(dow_adj_factor, 3) AS dow_adj_factor,
          ROUND(
            CASE WHEN (faciltype = 1)
              THEN dow_adj_factor::NUMERIC * aadt::NUMERIC * percent_daily_volume::NUMERIC
              ELSE dow_adj_factor::NUMERIC * aadt::NUMERIC * percent_daily_volume::NUMERIC / 2::NUMERIC
            END,
            3
          ) AS "120-07060",
          ROUND(
            dow_adj_factor::NUMERIC
            *
            percent_daily_volume::NUMERIC,
            6
          ) AS " ",
          tstamp
        FROM tmp_traff_dists
          INNER JOIN tmc_attributes USING (is_interstate)
        WHERE (
          (tmc = '120-07060')
          AND
          (day_type = 'WEEKEND'::traffic_dist_day_type)
        )
    ) AS "sub_120-07060" USING (bin, tstamp)
    ORDER BY bin
) TO STDOUT DELIMITER ',' CSV HEADER;
