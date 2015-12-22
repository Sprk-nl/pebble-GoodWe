/**
 * Welcome to GoodWe
 * This application is build by Gaston Bougie for educational purposes, learning how to code a Pebble
 *
 * The app will connect to GoodWe webpage, receive the solar data and display a bar graph.
 * Started building on  2015-10-01
 * Last modification on 2015-12-22
 *
 * Notes:
 * Screen resolution Pebble Time: 144x168
 * You need to replace the var SolaruserID with your own ID
 */

// Import the requirements
var UI = require('ui');
var Vector2 = require('vector2');
var Light = require('ui/light'); // Adding backlight control


var SolaruserID = '--------';
var SolarDateDay = 0;
var solar_HourPower = [];
var solar_PowerScale = 1;
var rasterX = [];  
var solar_current_count;
var MaxSolarCapacity = 4600;
var capacity = 4600;
var solar_HourPowerMAX;
// Enable logging: change LogActive to 1
var LogActive = 1;

var sc_item_data = [];
var sc_item = [];
sc_item[0] = "curpower" ;
sc_item[1] = "capacity" ;
sc_item[2] = "percent" ;
sc_item[3] = "status" ;
sc_item[4] = "createdate" ;
sc_item[5] = "eday" ;
sc_item[6] = "etotal" ;
sc_item[7] = "income" ;
sc_item[8] = "totalincome" ;
sc_item[9] = "co2reduce" ;
sc_item[10] = "totalco2reduce" ;
sc_item[11] = "treesaved" ;
sc_item[12] = "totaltreesaved" ;

var xhrRequest = function (url, type, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    callback(this.responseText);
  };
  xhr.open(type, url);
  xhr.send();
};

// Create main Card
var main = new UI.Card({
  title: 'GoodWe',
  style: 'small',
  icon: 'images/menu_icon.png',
  subtitle: getdate(SolarDateDay),
  body: '\nUp/Down for date.\nSelect for result.',
  subtitleColor: 'indigo', // Named colors
  bodyColor: '#9a0036' // Hex colors
    
});
// Defining buttons for Main Card
main.on('click', 'select', function(e) {
// Showing graph
show_main_window();
});
main.on('click', 'up', function(e) {
  if (SolarDateDay === 0) {
    if (LogActive) console.log("Already at most current day");
  }
  else {
    SolarDateDay = (SolarDateDay + 1);
    main.subtitle( getdate(SolarDateDay) );
    main.show();
  }
});
main.on('click', 'down', function(e) {
  SolarDateDay = (SolarDateDay - 1);
  main.subtitle( getdate(SolarDateDay) );
  main.show();
});



// Create main_window
var main_window = new UI.Window({
  fullscreen:true  
});
// Defining buttons for Main Window
main_window.on('click', 'select', function() {
  if (LogActive) console.log("Pressed select");
    main_window.remove();
    show_main_window(); // refreshing and reloading the window
});
main_window.on('click', 'up', function() {
  if (LogActive) console.log("Pressed up");
  if (SolarDateDay === 0) {
    if (LogActive) console.log("Already at most current day");
  }
  else {
    SolarDateDay = (SolarDateDay + 1);
    main_window.remove();
    show_main_window();

  }
});
main_window.on('click', 'down', function() {
  if (LogActive) console.log("Pressed down");
  SolarDateDay = (SolarDateDay - 1);
    main_window.remove();
    show_main_window();
});
main_window.on('click', 'back', function() {
  if (LogActive) console.log("Pressed back");
  main_window.hide();
  main.subtitle( getdate(SolarDateDay) );
});


var window_top_text_Left = new UI.Text({
  position: new Vector2(0, 0),
  size: new Vector2(144, 19),
  font: 'gothic-18',
  textColor : "white",
  text: " -",
  textAlign: 'left'
});

var window_top_text_Right = new UI.Text({
  position: new Vector2(0, 0),
  size: new Vector2(144, 19),
  font: 'gothic-18',
  textColor : "white",
  text: "- ",
  textAlign: 'right'
});

var window_middle = new UI.Rect({
  position: new Vector2(0, 20),
  size: new Vector2(144, 128),
  backgroundColor: 'yellow'
});

var window_bottom_text_Left = new UI.Text({
  position: new Vector2(0, 148),
  size: new Vector2(144, 20),
  font: 'gothic-18',
  textColor : "white",
  text: " -",
  textAlign: 'left'
});

var window_bottom_text_Right = new UI.Text({
  position: new Vector2(0, 148),
  size: new Vector2(144, 20),
  font: 'gothic-18',
  textColor : "white",
  text: "- ",
  textAlign: 'right'
});


// Define the vertical bar template in the graph
var chartBar = new UI.Rect({
  position: new Vector2(0, 0) ,
  size: new Vector2(0, 0) ,
  backgroundColor: 'black'
}); 

// Defining various functions
function updateTopTextLeft() {
    // UPDATING BOTTOW TEXT:
    if (LogActive) console.log("updateTopTextLeft:               " + getdate(SolarDateDay) );
  window_top_text_Left.text( getdate(SolarDateDay) );
}

function updateTopTextRight() {
    // UPDATING BOTTOW TEXT:
    if (LogActive) console.log("updateTopTextRight:              " + sc_item_data[5].toString() );
    window_top_text_Right.text(sc_item_data[5]);
}

function updateBottomTextLeft() {
    // UPDATING BOTTOW TEXT:
    if (LogActive) console.log("updateBottomTextLeft:   max:      " + solar_HourPowerMAX.toString() );
  window_bottom_text_Left.text(solar_HourPowerMAX.toString() + "W" );
}

function updateBottomTextRight() {
    // UPDATING BOTTOW TEXT:
    if (LogActive) console.log("updateBottomTextRight:   Current: " + sc_item_data[0].toString());
  window_bottom_text_Right.text(sc_item_data[0].toString());
}

function getCurrentSolarData(date) {
    if (LogActive) console.log("Function: getCurrentSolarData");
  // Construct URL
  var url_current = 'http://www.goodwe-power.com/Mobile/GetMyPowerStationById?stationID=' + SolaruserID;
  // Sending complete URL for debug
    if (LogActive) console.log('url_current = ' + url_current);
  
    // Send request to URL
    xhrRequest(url_current, 'GET', 
      function(responseText) {
      // responseText contains JSON data
      // solar_json contains java objects
      var solar_current = JSON.parse(responseText);
      solar_current_count = Object.keys(solar_current).length;
        if (LogActive) console.log("solar_current_count = " + solar_current_count);
        
        // importing json data to array[] NOT WORKING BECAUSE OF DYNAMIC sc_item[sc_counter]
//        for ( var sc_counter = 0; sc_counter < solar_current_count; sc_counter++ ) {
//          sc_item_data[sc_counter] = solar_current.sc_item[sc_counter];
//          console.log("sc_item_data[sc_counter] = " + sc_item_data[sc_counter]);
//        }

sc_item_data[0] = solar_current.curpower ;
sc_item_data[1] = solar_current.capacity ;
sc_item_data[2] = solar_current.percent ;
sc_item_data[3] = solar_current.status ;
sc_item_data[4] = solar_current.createdate ;
sc_item_data[5] = solar_current.eday ;
sc_item_data[6] = solar_current.etotal ;
sc_item_data[7] = solar_current.income ;
sc_item_data[8] = solar_current.totalincome ;
sc_item_data[9] = solar_current.co2reduce ;
sc_item_data[10] = solar_current.totalco2reduce ;
sc_item_data[11] = solar_current.treesaved ;
sc_item_data[12] = solar_current.totaltreesaved ;
        
        
          if (LogActive) console.log("Function: update Title text from getCurrentSolarData");
        updateTopTextLeft();
        updateTopTextRight();
        updateBottomTextRight();
      }
  );
}
        
function getSolarData(date) {
    if (LogActive) console.log("Function: getSolarData");
              // Construct URL
  var url = 'http://www.goodwe-power.com/Mobile/GetPacLineChart?stationId=' + SolaruserID + '&date=' + date;
  // Sending complete URL for debug
    if (LogActive) console.log('url = ' + url);
  
    // Send request to URL
    xhrRequest(url, 'GET', 
      function(responseText) {
      // responseText contains JSON data
      // solar_json contains java objects
      var solar_json = JSON.parse(responseText);
      var solar_json_count = Object.keys(solar_json).length;
      
          
        // importing json data to array[]
        for ( var counter = 0; counter < solar_json_count; counter++ ) {
          solar_HourPower[counter] = Number(solar_json[counter].HourPower);
        }
        updateTopTextRight();
        
        // defining the scale to use:
          if (LogActive) console.log ( "Defining the scale for Y axis");
          if (LogActive) console.log ( "solar_HourPower array : " + solar_HourPower.toString() );
        solar_HourPowerMAX = Math.max.apply(Math, solar_HourPower);      
          if (LogActive) console.log ("solar_HourPowerMAX : " + solar_HourPowerMAX + "W");
          if (LogActive) console.log ("capacity           : " + capacity + "W");
        var testscale = Math.round( capacity / solar_HourPowerMAX );       
        if ( testscale <= 1) {
          solar_PowerScale = 1;
            if (LogActive) console.log("Data Scale set to 1, was to low : " + testscale);
        } else if (testscale >= 25) {
          solar_PowerScale = 1;
            if (LogActive) console.log("Data Scale set to 1, was to high : " + testscale);  
        }   else {
          solar_PowerScale = testscale;
            if (LogActive) console.log("Data Scale = " + solar_PowerScale);
          } 
        
        
        
//        for ( counter = 0; counter < Object.keys(solar_json).length; counter++ ) {
//          console.log('Results = ' + solar_HourPower[counter]);          
//        }
        addGraphData();
        updateBottomTextLeft();
      }
    ); 


}

function addHorizontalBars() {
var rectBarStartX = 0;
var rectBarStartYmin = 20;
var rectBarStartYmax = 148;

var barSizePerWatt = Number(Math.round( MaxSolarCapacity / (rectBarStartYmax - rectBarStartYmin) ) );
  
  
  // HORIZONTAL RASTER BEGIN
  var horizonline = [];
    horizonline[0] =  500;
    horizonline[1] = 1000;
    horizonline[2] = 1500;
    horizonline[3] = 2000;
    horizonline[4] = 2500;
    horizonline[5] = 3000;
    horizonline[6] = 3500;
    horizonline[7] = 4000;
  
  var horizoncolor = [];
    horizoncolor[0] = "black";
    horizoncolor[1] = "black";
    horizoncolor[2] = "black";
    horizoncolor[3] = "black";
    horizoncolor[4] = "black";
    horizoncolor[5] = "black";
    horizoncolor[6] = "black";
    horizoncolor[7] = "black";

  for ( var x_line = 0; x_line <= 7; x_line++ ) {
var posX_line1 = rectBarStartX;
var posY_line1 = rectBarStartYmin + ( (rectBarStartYmax - rectBarStartYmin) - Math.round(Number(horizonline[x_line]) / barSizePerWatt) ) ;
var sizX_line1 = 144;
var sizY_line1 = 1;
  
  
var line1 = new UI.Rect({
  position: new Vector2(posX_line1, posY_line1) ,
  size: new Vector2(sizX_line1, sizY_line1) ,
  backgroundColor: horizoncolor[x_line]
});
//  console.log("posX_line1=" + posX_line1 + "  posY_line1=" + posY_line1 + "  sizX_line1=" + sizX_line1 + "  sizY=_line1" + sizY_line1);
    main_window.add(line1);
  }
// HORIZONTAL RASTER END  
}

function addGraphData(){
    if (LogActive) console.log("Function: addGraphData");
// Adding graph data
// Screen resolution: 144x168
// BAR SIZE: X starts at 0, Y starts at 47
// Ymax=4600Watt = 4600Watt / 118pixels = 40W/pix

var rectBarStartX = 0;
var rectBarStartYmin = 20;
var rectBarStartYmax = 148;
var barSizePerWatt = Number(Math.round( MaxSolarCapacity / (rectBarStartYmax - rectBarStartYmin) ) );
//      if (LogActive) console.log("barSizePerWatt      : " + barSizePerWatt); 
//      if (LogActive) console.log("solar_HourPower[47] : " + solar_HourPower[47]);
  
  
// Create vertical bar's in graph
for ( var x = 0; x <= 144; x++ ) {
  // Only run if we have solar power above 0W
  if (solar_HourPower[x] >= 0) {
  var posX = rectBarStartX + x;
  var posY = rectBarStartYmin + ( (rectBarStartYmax - rectBarStartYmin) - Math.round(Number(solar_HourPower[x]) / barSizePerWatt * solar_PowerScale) ) ;
  var sizX = 1;
  var sizY = Math.round(Number(solar_HourPower[x]) / barSizePerWatt * solar_PowerScale);
  // Logging of vertical bars:
  // console.log("posX=" + posX + "  posY=" + posY + "  sizX=" + sizX + "  sizY=" + sizY);

chartBar = new UI.Rect({
  position: new Vector2(posX-1, posY) ,
  size: new Vector2(sizX, sizY) ,
  backgroundColor: 'black'
}); 
 main_window.add(chartBar);
} 
}
}
  
function getdate(SolarDateDay){
  if (LogActive) console.log("Function: getdate");
var dateObj = new Date();

//change day dynamic
dateObj.setDate(dateObj.getDate() + SolarDateDay);
  
var month = dateObj.getUTCMonth() + 1; //months from 1-12
var day = dateObj.getUTCDate();
var year = dateObj.getUTCFullYear();
SolarDate = year + "-" + month + "-" + day;
    if (LogActive) console.log("getdate result: " + year + "-" + month + "-" + day);
return SolarDate;
}

function addrasterXBar(){
    if (LogActive) console.log("addrasterXBar: create X raster for 0, 6, 12, 18 and 24h");
  rasterX[0] = 0;
  rasterX[1] = 144/2/2;
  rasterX[2] = 144/2;  
  rasterX[3] = 3 * rasterX[1];
  rasterX[4] = 144;  
  
for ( var rx = 0; rx <= 4; rx++ ) {
var rasterXposX = rasterX[rx] - 1;
var rasterXposY = 149;
var rasterXsizX = 3;
var rasterXsizY = 5;
  // Logging of all bar's:
  // console.log("rasterXposX=" + rasterXposX + "  rasterXposY=" + rasterXposY + "  rasterXsizX=" + rasterXsizX + "  rasterXsizY=" + rasterXsizY);

var rasterXBar = new UI.Rect({
  position: new Vector2(rasterXposX, rasterXposY) ,
  size: new Vector2(rasterXsizX, rasterXsizY) ,
  backgroundColor: 'white'
});
 main_window.add(rasterXBar);
  
}
}


function show_main_window(){
    if (LogActive) console.log("Function: show_main_window");
 
  getCurrentSolarData( getdate(SolarDateDay) );
  getSolarData( getdate(SolarDateDay) );
  
  // adding title and subtitle to the main_window
  main_window.add(window_top_text_Left);
  main_window.add(window_top_text_Right);
  main_window.add(window_middle);
  main_window.add(window_bottom_text_Left);
  main_window.add(window_bottom_text_Right);
  // Display the main_window
  main_window.show();
  // Turn on the light for a longer time.
  Light.on('long');

  addrasterXBar();
  addHorizontalBars();
  updateTopTextLeft();

}



// Showing the main Card
main.show();
