SELECT
    tmc,
    PERCENTILE_DISC( array[0.50, 0.80])
      WITHIN GROUP (ORDER BY travel_time_all_vehicles)
  FROM ny.npmrds
  WHERE (
    (date between '20170201' and '20171231')
    AND
    (tmc = '120P16573')
    AND
    (epoch between 120 and 189)
  )
  GROUP BY tmc;
