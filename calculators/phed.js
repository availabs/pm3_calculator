
const dayVolume = [
  0.80,
  1.05,
  1.05,
  1.05,
  1.05,
  1.10,
  0.9
]

const calculatePHED = function calculatePHED (tmcAttributes, tmcFiveteenMinIndex, distroArray, time=12, mean='hmean') {
  var tmc = tmcAttributes.tmc
  var dirFactor = +tmcAttributes.faciltype > 1 ? 2 : 1 
  var DirectionalAADT = tmcAttributes.aadt / dirFactor
  var distroData = distroArray
    .map( (val, index) => {
      return {hour: index, count: val}
    })
  //console.log('distro data', distroArray.reduce((a,b) => a + b ))
  var TestVolume = distroArray.map(d => {return (d) * DirectionalAADT})
  //console.log('TestVolume', TestVolume.reduce((a,b) => a + b ), DirectionalAADT)
  
  //tmcAttributes.avg_speedlimit = 45 // this is supid 
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
    var hmean_tt = precisionRound(len / hsum_tt, 0)
    var mean_tt = precisionRound(sum_tt / len, 0)
    var threshold_travelTime = Math.round((tmcAttributes.length / ThresholdSpeed) * 3600)
    var speedlimit_travelTime = (tmcAttributes.length / +tmcAttributes.avg_speedlimit) * 3600
    var hmean_delay = hmean_tt > threshold_travelTime ?
       Math.min(Math.round(hmean_tt) - threshold_travelTime, 900) / 3600
       : null
    var mean_delay = mean_tt > threshold_travelTime ?
       Math.min(Math.round(mean_tt) - threshold_travelTime, 900) / 3600
       : null
    hmean_delay = precisionRound(hmean_delay,4)
    mean_delay = precisionRound(mean_delay,4)
    var days = ['Sun', 'Mon', 'Tues', 'Weds', 'Thurs', 'Fri', 'Sat']
    
    // Calculate Daily AADT then Disagregate 
    // var dailyAADT = dayVolume[dateTime.getDay()] * DirectionalAADT
    // var TrafficVolume = distroArray.map(d => {return (d / 100) * dailyAADT})
    
    var dailyAADT = DirectionalAADT
    var TrafficVolume = distroArray.map(d => {
        return ((d / 100) * dailyAADT) * dayVolume[dateTime.getDay()]
    })
    
    var fifteenMinuteVolumes = time === 12
      ? precisionRound((+TrafficVolume[parseInt(hour)] / 4),1)
      : precisionRound(+TrafficVolume[epoch],1)
    
    // console.log('Traffic Volume', TrafficVolume)
    // console.log('fifteen Minute Volumes', fifteenMinuteVolumes)
    var hmean_vehicle_delay = ((hmean_delay * fifteenMinuteVolumes))
    var mean_vehicle_delay = ((mean_delay * fifteenMinuteVolumes))
    hmean_vehicle_delay = precisionRound(hmean_vehicle_delay, 3)
    mean_vehicle_delay = precisionRound(mean_vehicle_delay, 3)

      return {
        tmc,
        dateTime,
        epoch,
        speedlimit: +tmcAttributes.avg_speedlimit,
        tt: mean === 'hmean' ? hmean_tt : mean_tt,
        delay: mean === 'hmean' ? hmean_delay : mean_delay,
        vehicle_delay: mean === 'hmean' ? hmean_vehicle_delay : hmean_vehicle_delay,
      }
    })

  var fifteenPeaks = fifteenData.map(d => {
    var out = Object.assign({}, d);
    if (!((d.epoch >= 24 && d.epoch< 40) ||  (d.epoch >= 60 && d.epoch < 76)) ) {
      out.tt = null
      out.delay = null
      out.vehicle_delay = null

    }
    // if (!((d.epoch >= 24 && d.epoch< 40) ||  (d.epoch >= 60 && d.epoch < 80)) ) {
    //   out.vehicle_delay_bp = null
    //   out.vehicle_delay_bp = null
    // }

    if (d.dateTime.getDay() === 0 || d.dateTime.getDay() === 6 ) {
      out.tt = null
      out.delay = null
      out.vehicle_delay = null
    }
    return out
  })
  //let analysis_data = fifteenPeaks.filter(d => d.vehicle_delay_bp)
  fifteenPeaks = fifteenPeaks.filter(d => d.vehicle_delay)
  var delay = {}
  var vehicle_delay = {}
  var months = [0,1,2,3,4,5,6,7,8,9,10,11]
    .forEach((month) => {
      var raw_data =  fifteenPeaks
        .filter(d => { 
          return d.dateTime.getMonth() === month 
        })

      var cur_delay = raw_data.reduce((out, curr) => {
        out += curr.delay
        return out
      },0)
      delay[`d_${month+1}`] = precisionRound(cur_delay, 3)
      
      var curr_vehicle_delay = raw_data.reduce((out, curr) => {
        out += curr.vehicle_delay
        return out
      },0)
      vehicle_delay[`vd_${month+1}`] = precisionRound(curr_vehicle_delay, 3)
      
    })

  vehicle_total = precisionRound(fifteenPeaks.reduce((out, curr) => {
    out += curr.vehicle_delay
    return out
  },0), 3)
  vehicle_delay[`vd_total`]= vehicle_total

  delay_total = precisionRound(fifteenPeaks.reduce((out, curr) => {
    out += curr.delay
    return out
  },0), 3)
  delay[`d_total`] = delay_total

  // console.log(delay, vehicle_delay)

  return {
    delay,
    vehicle_delay
  }
}

module.exports = calculatePHED

function precisionRound(number, precision) {
  var factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
}