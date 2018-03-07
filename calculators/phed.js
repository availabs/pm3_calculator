function precisionRound(number, precision) {
  let factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
}
const dayVolume = [
  0.85,
  1.05,
  1.05,
  1.05,
  1.05,
  1.10,
  0.85
]

const calculatePHED = function calculatePHED (tmcAttributes, travelTimeResponse, distroArray) {
  var tmc = tmcAttributes.tmc
  var dirFactor = +tmcAttributes.faciltype > 1 ? 2 : 1 
  var DirectionalAADT = tmcAttributes.aadt / dirFactor
  var distroData = distroArray
    .map( (val, index) => {
      return {hour: index, count: Math.round(val)}
    })
  var TestVolume = distroArray.map(d => {return (d / 100) * DirectionalAADT})
  // console.log('---------------------------------------------')
  // console.log('aadt', DirectionalAADT)
  // console.log('AADT Distro', TestVolume)
  // console.log('travelTimeResponse', travelTimeResponse.length)
  var tmcFiveteenMinIndex = travelTimeResponse.reduce((output, current) => {
    var reduceIndex = current.npmrds_date + '_' + Math.floor(current.epoch/3)
    if (!output[reduceIndex]) { output[reduceIndex] = { speed:[], tt:[] } }
    output[reduceIndex].speed.push(+tmcAttributes.length / (current.travelTime / 3600))
    output[reduceIndex].tt.push(current.travelTime)
    return output
  }, {})
  //console.log('15 minute length', Object.keys(tmcFiveteenMinIndex).length)
  
  var ThresholdSpeed = +tmcAttributes.avg_speedlimit * 0.6 > 20 
    ? +tmcAttributes.avg_speedlimit * .6 
    : 20
  var fifteenData = Object.keys(tmcFiveteenMinIndex).map( (key,i) => {
  var epoch = key.split('_')[1]
  var hour = Math.floor(epoch / 4).toString()
  hour = hour.length === 1 ? ('0' + hour) : hour
  var min = ((epoch % 4) * 15).toString()
  min = min.length === 1 ? ('0' + min) : min
  var dateString = key.split('_')[0]
  var yearMonthDay = dateString.substring(0, 4) +
    '-' + dateString.substring(4, 6) +
    '-' + dateString.substring(6, 8)
  var dateTime = new Date(yearMonthDay + 'T' + hour + ':' + min + ':00')
  var len = tmcFiveteenMinIndex[key].speed.length
  var sum_speed = tmcFiveteenMinIndex[key].speed.reduce((a, b) => a += b)
  var hsum_speed = tmcFiveteenMinIndex[key].speed.reduce((a, b) => { return a += (1 / b) }, 0)
  var hmean_speed = precisionRound(len / hsum_speed, 2)
  var mean_speed = precisionRound(sum_speed / len, 2)
  var sum_tt = tmcFiveteenMinIndex[key].tt.reduce((a, b) => a += b)
  var hsum_tt = tmcFiveteenMinIndex[key].tt.reduce((a, b) => { return a += (1 / b) }, 0)
  var hmean_tt = precisionRound(len / hsum_tt, 2)
  var mean_tt = precisionRound(sum_tt / len, 2)
  var threshold_travelTime = (tmcAttributes.length / ThresholdSpeed) * 3600
  var speedlimit_travelTime = (tmcAttributes.length / +tmcAttributes.avg_speedlimit) * 3600
  var hmean_delay = hmean_tt > threshold_travelTime ?
     Math.min(Math.round(hmean_tt) - threshold_travelTime, 900)
     : null
  var mean_delay = mean_tt > threshold_travelTime ?
     Math.min(Math.round(mean_tt) - threshold_travelTime, 900)
     : null
  var days = ['Sun', 'Mon', 'Tues', 'Weds', 'Thurs', 'Fri', 'Sat']
  var dailyAADT = dayVolume[dateTime.getDay()] * DirectionalAADT
  //var TrafficVolume = distroArray.map(d => {return (d / 100) * DirectionalAADT})
  var TrafficVolume = distroArray.map(d => {return (d / 100) * dailyAADT})
  //console.log(hmean_delay, TrafficVolume[parseInt(hour)] / 4, (hmean_delay * (TrafficVolume[parseInt(hour)] / 4)) / 3600 )
  var hmean_vehicle_delay = ((hmean_delay * (+TrafficVolume[parseInt(hour)] / 4)) / 3600)
    return {
      dateTime,
      epoch,
      'Mean': hmean_speed,
      'Harmonic Mean': mean_speed,
      speedlimit: +tmcAttributes.avg_speedlimit,
      hmean_tt,
      mean_tt,
      hmean_delay,
      hmean_vehicle_delay
    }
  })

  var fifteenPeaks = fifteenData.map(d => {
    var out = Object.assign({}, d);
    if (!((d.epoch >= 24 && d.epoch< 40) ||  (d.epoch >= 60 && d.epoch < 76)) ) {
      out['Mean'] = null
      out['Harmonic Mean'] = null
      out['mean_tt'] = null
      out['hmean_tt'] = null
      out.hmean_delay = null
      out.hmean_vehicle_delay = null
    }
    if (d.dateTime.getDay() === 0 || d.dateTime.getDay() === 6 ) {
      out['Mean'] = null
      out['Harmonic Mean'] = null
      out['mean_tt'] = null
      out['hmean_tt'] = null
      out.hmean_delay = null
      out.hmean_vehicle_delay = null
    }
    return out
  })

  fifteenPeaks = fifteenPeaks.filter(d => d.hmean_vehicle_delay)
  var hmean_delay = []
  var hmean_vehicle_delay = []
  var months = [0,1,2,3,4,5,6,7,8,9,10,11]
    .forEach((month) => {
      var raw_data =  fifteenPeaks
        .filter(d => { 
          return d.dateTime.getMonth() === month 
        })
      console.log(raw_data)
      var delay = raw_data.reduce((out, curr) => {
        out += curr.hmean_delay
        return out
      },0)
      hmean_delay.push( precisionRound(delay, 2))
      
      var vehicle_delay = raw_data.reduce((out, curr) => {
        out += curr.hmean_vehicle_delay
        return out
      },0)
      hmean_vehicle_delay.push( precisionRound(vehicle_delay, 2) )
      
    })

  vehicle_total = precisionRound(fifteenPeaks.reduce((out, curr) => {
        out += curr.hmean_vehicle_delay
        return out
      },0), 2)
  hmean_vehicle_delay.unshift(vehicle_total)

  delay_total = precisionRound(fifteenPeaks.reduce((out, curr) => {
        out += curr.hmean_delay
        return out
      },0), 2)
  hmean_delay.unshift(delay_total)

  return {
    hmean_delay,
    hmean_vehicle_delay
  }
}
module.exports = calculatePHED