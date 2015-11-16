var UI = require('ui');
// var ajax = require('ajax');
// Screen resolution Pebble Time: 144x168
var Vector2 = require('vector2');
var SolaruserID = 'YOUR OWN GOODWE ID LIKE r27ubd92-g3e6e-4d51-23434-8e16dd5f42352345b';
var SolarDate = '2015-09-29';
var SolarDateDay = 0;
var solar_HourPower = [];
var solar_PowerScale = 1;
var rasterX = [];  
var solar_current_count;
var MaxSolarCapacity = 4600;
var capacity = 4600;
var solar_HourPowerMAX;

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

// Create main_window
var main_window = new UI.Window({
  fullscreen:true  
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
  backgroundColor: 'white'
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


// Define the bars in the graph
var chartBar = new UI.Rect({
  position: new Vector2(0, 0) ,
  size: new Vector2(0, 0) ,
  backgroundColor: 'black'
}); 


// Defining buttons
main_window.on('click', 'up', function() {
  console.log("click: up");
});

main_window.on('click', 'select', function() {
  console.log("click: select");
  menu.show();
});

main_window.on('click', 'back', function() {
  console.log("click: back");
});

main_window.on('click', 'down', function() {
  console.log("click: down");
  removeGraphData();
  show_main_window();
  SolarDateDay = SolarDateDay + 1;
  getdate(SolarDateDay);
  addrasterXBar();
  getSolarData(SolarDate);
  updateTitleText();
});



function updateTitleText(){
  console.log("Function: updateTitleText");
  window_top_text_Left.text(SolarDate);
  window_top_text_Right.text(sc_item_data[5]);
}

function updateBottomTextLeft() {
    // UPDATING BOTTOW TEXT:
  console.log("updateBottomTextLeft:   max: " + solar_HourPowerMAX.toString() );
  window_bottom_text_Left.text(solar_HourPowerMAX.toString() + "W" );
}

function updateBottomTextRight() {
    // UPDATING BOTTOW TEXT:
  console.log("updateBottomTextRight:   Current: " + sc_item_data[0].toString());
  window_bottom_text_Right.text(sc_item_data[0].toString());
}



function getCurrentSolarData(date) {
  console.log("Function: getCurrentSolarData");
  // Construct URL
  var url_current = 'http://www.goodwe-power.com/Mobile/GetMyPowerStationById?stationID=' + SolaruserID;
  // Sending complete URL for debug
  console.log('url_current = ' + url_current);
  
    // Send request to URL
    xhrRequest(url_current, 'GET', 
      function(responseText) {
      // responseText contains JSON data
      // solar_json contains java objects
      var solar_current = JSON.parse(responseText);
      solar_current_count = Object.keys(solar_current).length;
      console.log("solar_current_count = " + solar_current_count);
        
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
        
        
        console.log("Function: update Title text from getCurrentSolarData");
        updateTitleText();
      }
  );
}
        
function getSolarData(date) {
  console.log("Function: getSolarData");
              // Construct URL
  var url = 'http://www.goodwe-power.com/Mobile/GetPacLineChart?stationId=' + SolaruserID + '&date=' + date;
  // Sending complete URL for debug
  console.log('url = ' + url);
  
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
        
        // defining the scale to use:
        console.log ( "Defining the scale for Y axis");
        console.log ( "solar_HourPower array : " + solar_HourPower.toString() );
        solar_HourPowerMAX = Math.max.apply(Math, solar_HourPower);      
        console.log ("solar_HourPowerMAX : " + solar_HourPowerMAX + "W");
        console.log ("capacity           : " + capacity + "W");
        var testscale = Math.round( capacity / solar_HourPowerMAX );       
        if ( testscale <= 1) {
          solar_PowerScale = 1;
          console.log("Data Scale set to 1, was to low : " + testscale);
        } else if (testscale >= 25) {
          solar_PowerScale = 1;
          console.log("Data Scale set to 1, was to high : " + testscale);  
        }   else {
          solar_PowerScale = testscale;
          console.log("Data Scale = " + solar_PowerScale);
          } 
        
        
        
//        for ( counter = 0; counter < Object.keys(solar_json).length; counter++ ) {
//          console.log('Results = ' + solar_HourPower[counter]);          
//        }
        addGraphData();
        updateBottomTextLeft();
        updateBottomTextRight();
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
  console.log("Function: addGraphData");
// Adding graph data
// Screen resolution: 144x168
// BAR SIZE: X starts at 0, Y starts at 47
// Ymax=4600Watt = 4600Watt / 118pixels = 40W/pix

var rectBarStartX = 0;
var rectBarStartYmin = 20;
var rectBarStartYmax = 148;
var barSizePerWatt = Number(Math.round( MaxSolarCapacity / (rectBarStartYmax - rectBarStartYmin) ) );
//    console.log("barSizePerWatt      : " + barSizePerWatt); 
//    console.log("solar_HourPower[47] : " + solar_HourPower[47]);




  
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

function removeGraphData() {
  main_window.clear();
}
  
function getdate(SolarDateDay){
console.log("Function: getdate");
var dateObj = new Date();

//change day dynamic
dateObj.setDate(dateObj.getDate() + SolarDateDay);
  
var month = dateObj.getUTCMonth() + 1; //months from 1-12
var day = dateObj.getUTCDate();
var year = dateObj.getUTCFullYear();
SolarDate = year + "-" + month + "-" + day;
  console.log("getdate result: " + year + "-" + month + "-" + day);
}

function addrasterXBar(){
  console.log("addrasterXBar: create X raster for 0, 6, 12, 18 and 24h");
  rasterX[0] = 0;
  rasterX[1] = 144/2/2;
  rasterX[2] = 144/2;  
  rasterX[3] = 3 * rasterX[1];
  rasterX[4] = 144;  
  
for ( var rx = 0; rx <= 4; rx++ ) {
var rasterXposX = rasterX[rx] - 1;
var rasterXposY = 150;
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
  console.log("Function: show_main_window");
  // adding title and subtitle to the main_window
  main_window.add(window_top_text_Left);
  main_window.add(window_top_text_Right);
  main_window.add(window_middle);
 // main_window.add(window_bottom);
  main_window.add(window_bottom_text_Left);
  main_window.add(window_bottom_text_Right);
  // Display the main_window
  main_window.show();
}


show_main_window();
addrasterXBar();
getdate(SolarDateDay);
getCurrentSolarData(SolarDate);
addHorizontalBars();
getSolarData(SolarDate);
// updateTitleText();
