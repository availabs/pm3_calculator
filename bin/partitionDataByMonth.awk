#!/usr/bin/env awk

# https://unix.stackexchange.com/a/343723

NR==1{
  header=$0; 
  # Get the column number of the timestamp col
  for (i=1; i<=NF; i++) {
    if ($i=="measurement_tstamp") {
      tstamp_col=i
      break
    }
  }
  next 
} 

N!=1{
  # Use the tstamp yrmo to get the file path
  fpath=fpath_template 
  month=substr($tstamp_col,1,4) substr($tstamp_col,6,2)
  gsub("__MONTH__", month, fpath)

  # If we haven't seen this month yet,
  #   print the header to its file.
  if (!seen_months[month]) {
    print header > fpath
    seen_months[month]=1
  }

  print > fpath
}
