
var month_name = [
  'January',   //  0
  'February',  //  1
  'March',     //  2
  'April',     //  3
  'May',       //  4
  'June',      //  5
  'July',      //  6
  'August',    //  7
  'September', //  8
  'October',   //  9
  'November',  // 10
  'December',  // 11
];

var day_of_week = [
  'Sunday',    // 0
  'Monday',    // 1
  'Tuesday',   // 2
  'Wednesday', // 3
  'Thursday',  // 4
  'Friday',    // 5
  'Saturday',  // 6
];

var time_of_day = [
  'YEST Night / TODAY Morning', //  0 12am
  'YEST Night / TODAY Morning', //  1  1am
  'YEST Night / TODAY Morning', //  2  2am
  'YEST Night / TODAY Morning', //  3  3am
  'YEST Night / TODAY Morning', //  4  4am
  'TODAY Morning',              //  5  5am
  'TODAY Morning',              //  6  6am
  'TODAY Morning',              //  7  7am
  'TODAY Morning',              //  8  8am
  'TODAY Morning',              //  9  9am
  'TODAY Morning',              // 10 10am
  'TODAY Morning',              // 11 11am
  'TODAY Afternoon',            // 12 12pm
  'TODAY Afternoon',            // 13  1pm
  'TODAY Afternoon',            // 14  2pm
  'TODAY Afternoon',            // 15  3pm
  'TODAY Afternoon',            // 16  4pm
  'TODAY Evening',              // 17  5pm
  'TODAY Evening',              // 18  6pm
  'TODAY Evening',              // 19  7pm
  'TODAY Evening',              // 20  8pm
  'TODAY Evening',              // 21  9pm
  'TODAY Night',                // 22 10pm
  'TODAY Night',                // 23 11pm
];


function WorldClock_loadCSS() {
  var head = document.getElementsByTagName('head')[0];
  var link = document.createElement('link');
  link.rel   = 'stylesheet';
  link.type  = 'text/css';
  link.href  = 'WorldClock.css';
  link.media = 'all';
  head.appendChild(link);
}

var WorldClock_zoneData = {}

function WorldClock_populateNode( clockElem ) {
  if ( clockElem.populated == true ) {
    return;
  }
  clockElem.populated = true;

  if (clockElem.tagName != 'DIV') {
    clockElem.innerHTML = 'ERROR: element must be a "div"'
    return;
  }
  if (! clockElem.hasAttribute('data-worldclock-zone')) {
    clockElem.setAttribute('data-worldclock-zone', 'UTC')
  }
  if (! clockElem.hasAttribute('data-worldclock-name')) {
    clockElem.setAttribute('data-worldclock-name', 'CLOCK')
  }

  if ( clockElem.id == "" ) {
    function genId() {
      var text = "";
      var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
      for (idx=0; idx<8; idx++) {
        text += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return text;
    }
    clockElem.id = genId();
  }

  id = clockElem.id;
  time_city = document.createElement('span');
  time_city.className = 'WorldClockCity';
  time_city.id = id + '_city';
  time_city.innerHTML = clockElem.getAttribute('data-worldclock-name');
  clockElem.appendChild(time_city);
  clockElem.appendChild(document.createElement('hr'));
  time_dow = document.createElement('span');
  time_dow.className = 'WorldClockDayofweek';
  time_dow.id = id + '_dayofweek';
  clockElem.appendChild(time_dow);
  clockElem.appendChild(document.createElement('br'));
  time_time = document.createElement('span');
  time_time.className = 'WorldClockTime';
  time_time.id = id + '_time';
  clockElem.appendChild(time_time);
  clockElem.appendChild(document.createElement('br'));
  time_date = document.createElement('span');
  time_date.className = 'WorldClockDate';
  time_date.id = id + '_date';
  clockElem.appendChild(time_date);
  clockElem.appendChild(document.createElement('br'));
  time_zone = document.createElement('span');
  time_zone.className = 'WorldClockZone';
  time_zone.id = id + '_zone';
  clockElem.appendChild(time_zone);
  time_off = document.createElement('span');
  time_off.className = 'WorldClockOffset';
  time_off.id = id + '_offset';
  clockElem.appendChild(time_off);
  time_dst = document.createElement('span');
  time_dst.className = 'WorldClockDst';
  time_dst.id = id + '_dst';
  clockElem.appendChild(time_dst);

  var filename = 'zoneloc/' + clockElem.getAttribute('data-worldclock-zone') + '.json'
  clockElem.req = new XMLHttpRequest();
  clockElem.req.onreadystatechange = function() {
    if (this.readyState == 4 && (this.status == 200 || this.status == 0)) { // status == 0 when loading file: URI
      var text = this.responseText;
      if (text != "") {
        clockElem.zdata = eval(text);
      }
      WorldClock_renderClock(clockElem);
    }
  }
  clockElem.req.open("GET", filename);
  clockElem.req.send();
}

function WorldClock_getTimeZoneData( zoneData ) {
  var now = Date.now() / 1000;
  var last = 0
  for (var idx=1; idx < zoneData.length; idx += 1) {
    if (now < zoneData[idx]['start']) {
      break;
    }
    last = idx
  }
  return zoneData[last]
}

function WorldClock_renderClock(clockElem) {
  if ( clockElem.has_errors == true ) {
    return;
  }
  if ( clockElem.populated != true ) {
    WorldClock_populateNode( clockElem );
    return;
  }

  if ( clockElem.zdata == null ) {
    if (clockElem.req != null && clockElem.req.readyState == 4 && clockElem.req.responseText == "") {
      document.getElementById(clockElem.id + '_dayofweek').innerHTML = "Invalid zone:"
      document.getElementById(clockElem.id + '_date').innerHTML = clockElem.getAttribute('data-worldclock-zone')
      clockElem.has_errors = true;
    }
    return;
  }

  zdata = WorldClock_getTimeZoneData( clockElem.zdata );
  adjtime = new Date(Date.now() + (zdata['offset'] * 1000));

  adjh24 = adjtime.getUTCHours();
  adjh12 = adjh24
  adjmer = 'am';
  if ( adjh24 == 0 ) adjh12 = 12;
  if ( adjh24 >= 12 ) adjmer = 'pm';
  if ( adjh12 > 12 ) adjh12 -= 12;

  adjm = adjtime.getUTCMinutes();
  if ( adjm < 10 ) adjm = "0" + adjm;


  var today_dayofweek = day_of_week[adjtime.getUTCDay()];
  var yest_dayofweek = day_of_week[(adjtime.getUTCDay()+6)%7];
  var dayofweek = time_of_day[adjtime.getUTCHours()];
  dayofweek = dayofweek.replace('YEST', yest_dayofweek);
  dayofweek = dayofweek.replace('TODAY', today_dayofweek);

  var time;
  if ( clockElem.hasAttribute('data-worldclock-24') ) {
    time = adjh24 + ':' + adjm;
  } else {
    time = adjh12 + ':' + adjm + adjmer;
  }

  offset = zdata['offset']  / 3600;
  if ( offset > 0 ) {
    offset = '+' + offset;
  }

  id = clockElem.id
  document.getElementById(id + '_dayofweek').innerHTML = dayofweek;
//  document.getElementById(id + '_timeofday').innerHTML = time_of_day[adjtime.getUTCHours()];
  document.getElementById(id + '_time').innerHTML = time;
  document.getElementById(id + '_date').innerHTML = month_name[adjtime.getUTCMonth()] + ' ' +
                               adjtime.getUTCDate() + ', ' + adjtime.getUTCFullYear();
  document.getElementById(id + '_zone').innerHTML = zdata['name'];
  document.getElementById(id + '_offset').innerHTML = '(' + offset + ')';
  document.getElementById(id + '_dst').innerHTML = zdata['dst'] ? 'DST' : '';
}


function WorldClock_renderClocks() {
  var clocks = document.getElementsByClassName('WorldClock');
  for (var idx=0; idx < clocks.length; idx += 1) {
    WorldClock_renderClock(clocks[idx])
  }
}

function WorldClock_init() {
  WorldClock_renderClocks()
  setInterval(WorldClock_renderClocks, 5000);
}

WorldClock_loadCSS();
setTimeout(WorldClock_init, 100);
