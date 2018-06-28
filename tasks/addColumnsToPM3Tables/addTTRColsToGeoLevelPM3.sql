BEGIN;

ALTER TABLE __TABLE_NAME__
 ADD COLUMN IF NOT EXISTS lottr_noninterstate_ttr NUMERIC,
 ADD COLUMN IF NOT EXISTS lottr_noninterstate_ttr_1 NUMERIC,
 ADD COLUMN IF NOT EXISTS lottr_noninterstate_ttr_2 NUMERIC,
 ADD COLUMN IF NOT EXISTS lottr_noninterstate_ttr_3 NUMERIC,
 ADD COLUMN IF NOT EXISTS lottr_noninterstate_ttr_4 NUMERIC,
 ADD COLUMN IF NOT EXISTS lottr_noninterstate_ttr_5 NUMERIC,
 ADD COLUMN IF NOT EXISTS lottr_noninterstate_ttr_6 NUMERIC,
 ADD COLUMN IF NOT EXISTS lottr_noninterstate_ttr_7 NUMERIC,
 ADD COLUMN IF NOT EXISTS lottr_noninterstate_ttr_8 NUMERIC,
 ADD COLUMN IF NOT EXISTS lottr_noninterstate_ttr_9 NUMERIC,
 ADD COLUMN IF NOT EXISTS lottr_noninterstate_ttr_10 NUMERIC,
 ADD COLUMN IF NOT EXISTS lottr_noninterstate_ttr_11 NUMERIC,
 ADD COLUMN IF NOT EXISTS lottr_noninterstate_ttr_12 NUMERIC,
 ADD COLUMN IF NOT EXISTS lottr_interstate_ttr NUMERIC,
 ADD COLUMN IF NOT EXISTS lottr_interstate_ttr_1 NUMERIC,
 ADD COLUMN IF NOT EXISTS lottr_interstate_ttr_2 NUMERIC,
 ADD COLUMN IF NOT EXISTS lottr_interstate_ttr_3 NUMERIC,
 ADD COLUMN IF NOT EXISTS lottr_interstate_ttr_4 NUMERIC,
 ADD COLUMN IF NOT EXISTS lottr_interstate_ttr_5 NUMERIC,
 ADD COLUMN IF NOT EXISTS lottr_interstate_ttr_6 NUMERIC,
 ADD COLUMN IF NOT EXISTS lottr_interstate_ttr_7 NUMERIC,
 ADD COLUMN IF NOT EXISTS lottr_interstate_ttr_8 NUMERIC,
 ADD COLUMN IF NOT EXISTS lottr_interstate_ttr_9 NUMERIC,
 ADD COLUMN IF NOT EXISTS lottr_interstate_ttr_10 NUMERIC,
 ADD COLUMN IF NOT EXISTS lottr_interstate_ttr_11 NUMERIC,
 ADD COLUMN IF NOT EXISTS lottr_interstate_ttr_12 NUMERIC
;

COMMIT;
