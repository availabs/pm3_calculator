SELECT
    PERCENTILE_DISC( array[0.50, 0.80])
      WITHIN GROUP (ORDER BY tt)
  FROM (
    SELECT
        AVG(travel_time_all_vehicles) AS tt
    FROM ny.npmrds
    WHERE (
      (date between '20170201' and '20171231')
      AND
      (tmc = '120P16573')
      AND
      (epoch between 120 and 189)
    )
    GROUP BY date, (epoch / 3)
  ) AS sub_binned;
