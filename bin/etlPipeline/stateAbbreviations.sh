#!/bin/bash

STATE_ABBREVIATIONS=

declare -A STATE_ABBREVIATIONS

STATE_ABBREVIATIONS['alabama']=al
STATE_ABBREVIATIONS['alaska']=ak
STATE_ABBREVIATIONS['arizona']=az
STATE_ABBREVIATIONS['arkansas']=ar
STATE_ABBREVIATIONS['california']=ca
STATE_ABBREVIATIONS['colorado']=co
STATE_ABBREVIATIONS['connecticut']=ct
STATE_ABBREVIATIONS['delaware']=de
STATE_ABBREVIATIONS['florida']=fl
STATE_ABBREVIATIONS['georgia']=ga
STATE_ABBREVIATIONS['hawaii']=hi
STATE_ABBREVIATIONS['idaho']=id
STATE_ABBREVIATIONS['illinois']=il
STATE_ABBREVIATIONS['indiana']='in'
STATE_ABBREVIATIONS['iowa']=ia
STATE_ABBREVIATIONS['kansas']=ks
STATE_ABBREVIATIONS['kentucky']=ky
STATE_ABBREVIATIONS['louisiana']=la
STATE_ABBREVIATIONS['maine']=me
STATE_ABBREVIATIONS['maryland']=md
STATE_ABBREVIATIONS['massachusetts']=ma
STATE_ABBREVIATIONS['michigan']=mi
STATE_ABBREVIATIONS['minnesota']=mn
STATE_ABBREVIATIONS['mississippi']=ms
STATE_ABBREVIATIONS['missouri']=mo
STATE_ABBREVIATIONS['montana']=mt
STATE_ABBREVIATIONS['nebraska']=ne
STATE_ABBREVIATIONS['nevada']=nv
STATE_ABBREVIATIONS['new hampshire']=nh
STATE_ABBREVIATIONS['newhampshire']=nh
STATE_ABBREVIATIONS['new jersey']=nj
STATE_ABBREVIATIONS['newjersey']=nj
STATE_ABBREVIATIONS['new mexico']=nm
STATE_ABBREVIATIONS['newmexico']=nm
STATE_ABBREVIATIONS['new york']=ny
STATE_ABBREVIATIONS['newyork']=ny
STATE_ABBREVIATIONS['north carolina']=nc
STATE_ABBREVIATIONS['northcarolina']=nc
STATE_ABBREVIATIONS['north dakota']=nd
STATE_ABBREVIATIONS['northdakota']=nd
STATE_ABBREVIATIONS['ohio']=oh
STATE_ABBREVIATIONS['oklahoma']=ok
STATE_ABBREVIATIONS['oregon']=or
STATE_ABBREVIATIONS['pennsylvania']=pa
STATE_ABBREVIATIONS['rhode island']=ri
STATE_ABBREVIATIONS['rhodeisland']=ri
STATE_ABBREVIATIONS['south carolina']=sc
STATE_ABBREVIATIONS['southcarolina']=sc
STATE_ABBREVIATIONS['south dakota']=sd
STATE_ABBREVIATIONS['southdakota']=sd
STATE_ABBREVIATIONS['tennessee']=tn
STATE_ABBREVIATIONS['texas']=tx
STATE_ABBREVIATIONS['utah']=ut
STATE_ABBREVIATIONS['vermont']=vt
STATE_ABBREVIATIONS['virginia']=va
STATE_ABBREVIATIONS['washington']=wa
STATE_ABBREVIATIONS['west virginia']=wv
STATE_ABBREVIATIONS['westvirginia']=wv
STATE_ABBREVIATIONS['wisconsin']=wi
STATE_ABBREVIATIONS['wyoming']=wy

STATE_ABBREVIATIONS['district of columbia']=dc
STATE_ABBREVIATIONS['districtofcolumbia']=dc
STATE_ABBREVIATIONS['district']=dc
STATE_ABBREVIATIONS['guam']=gu
STATE_ABBREVIATIONS['puerto rico']=pr
STATE_ABBREVIATIONS['puertorico']=pr
STATE_ABBREVIATIONS['virgin islands']=vi
STATE_ABBREVIATIONS['virginislands']=vi

STATE_ABBREVIATIONS['canada']=cn
STATE_ABBREVIATIONS['mexico']=mx


STATE_ABBREVIATIONS['alberta']=ab
STATE_ABBREVIATIONS['british columbia']=bc
STATE_ABBREVIATIONS['britishcolumbia']=bc
STATE_ABBREVIATIONS['manitoba']=mb
STATE_ABBREVIATIONS['new brunswick']=nb
STATE_ABBREVIATIONS['newbrunswick']=nb
STATE_ABBREVIATIONS['newfoundland and labrador']=nl
STATE_ABBREVIATIONS['newfoundlandandlabrador']=nl
STATE_ABBREVIATIONS['northwest territories']=nt
STATE_ABBREVIATIONS['northwestterritories']=nt
STATE_ABBREVIATIONS['nova scotia']=ns
STATE_ABBREVIATIONS['novascotia']=ns
STATE_ABBREVIATIONS['nunavut']=nu
STATE_ABBREVIATIONS['ontario']=on
STATE_ABBREVIATIONS['prince edward island']=pe
STATE_ABBREVIATIONS['princeedwardisland']=pe
STATE_ABBREVIATIONS['quebec']=qc
STATE_ABBREVIATIONS['québec']=qc
STATE_ABBREVIATIONS['saskatchewan']=sk
STATE_ABBREVIATIONS['yukon']=yt

export STATE_ABBREVIATIONS
