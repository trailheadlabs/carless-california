"use strict";

var CarLess = (function(CarLess){
  var _featuredTripId = 1;
  var _tripIds = [];
  var _currentTripId;
  var _currentTripDetails;
  var _allTripMap = {};
  var _loadedMaps = {};
  var _baseMaps = {};
  var _overLays = {};
  var _map;
  var _currentBasemap;
  var  _trailStyle = {
      stroke: true,
      color: "#3E6D92",
      opacity: 1.0,
      weight: 5,
      lineCap: 'round',
      dashArray: "6,10"
    };

  var _startStyle = {
      "fillColor": "#37ee4f",
      "color" : "#3E6D92",
      "radius": 15,
      "opacity": 1.0,
      "fillOpacity": 1.0,
      "weight": 5
  };

  var _endStyle = {
      "fillColor": "#fc4f44",
      "color" : "#3E6D92",
      "radius": 15,
      "opacity": 1.0,
      "fillOpacity": 1.0,
      "weight": 5
  };


  function init(){
    L.mapbox.accessToken = 'pk.eyJ1IjoidHJhaWxoZWFkbGFicyIsImEiOiJzN29LeEU4In0.3tl1HARqdU8DYUPq064kyw';
    initBasemaps();
    $('body').on('click','.check-it-out-button',checkItOut);
    $('body').on('click','.get-directions-btn',launchDirections);
    $('body').on('click','.zoom-in-btn',zoomIn);
    $('body').on('click','.zoom-out-btn',zoomOut);
    $('body').on('click','.layer-toolbar-btn',openLayerToolbar);
    $('body').on('click','.layer-toolbar-close-btn',closeLayerToolbar);
    $('body').on('click','.basemap-btn',setBasemap);
    $('body').on('click','.layer-item',toggleLayer);
    $('body').on('click','.additional-info-container',toggleAdditionalInfo);
  }

  function initBasemaps(){
    _baseMaps['Hike'] = L.mapbox.tileLayer('trailheadlabs.63dd9d04');
    _baseMaps['Topo'] = L.mapbox.tileLayer('trailheadlabs.b9b3498e');
    _baseMaps['Satellite'] = L.mapbox.tileLayer('trailheadlabs.91eedbd1');
    _baseMaps['National Parks'] = L.mapbox.tileLayer('nps.2yxv8n84',{
      accessToken:'pk.eyJ1IjoibnBzIiwiYSI6ImNpaG5ua2l3NjBwMGt2YmtsNWNlbTB6NGUifQ.ierCbAbCgoiEzQJFXTeoYA'});
  }

  function setBasemap(event){
    var _name = $(this).data('name');
    if(_currentBasemap){
      _map.removeLayer(_currentBasemap);
    }
    _currentBasemap = _baseMaps[_name];
    _map.addLayer(_currentBasemap,true);
    return false;
  }

  function tripData(){
    return _allTripMap;
  }

  function getTrip(tripId){
    return _allTripMap[tripId];
  }

  function launchDirections(event){
    var _activityBox = $(this).closest('.activity-box');
    var tripId = _activityBox.data('trip-id');
    var urlTemplate = _.template("https://www.google.com/maps/dir/Current+Location/<%= latitude %>,<%= longitude %>");
    var trip = getTrip(tripId);
    var start = trip['starting_trailhead'];
    var end = trip['ending_trailhead'];
    var startUrl = urlTemplate({
      latitude:start['geometry']['coordinates'][1],
      longitude:start['geometry']['coordinates'][0]
    });
    window.open(startUrl,"_blank");
    if(end && end['id'] != start['id']){
      var urlTemplate = _.template("https://www.google.com/maps/dir/<%= latitude %>,<%= longitude %>/Current+Location");
      var endUrl = urlTemplate({
        latitude:start['geometry']['coordinates'][1],
        longitude:start['geometry']['coordinates'][0]
      });
      window.open(endUrl,"_blank");
    }
  }

  function zoomIn(event){
    var _activityBox = $(this).closest('.activity-box');
    var _id = _activityBox.data('trip-id');
    _loadedMaps[_id].zoomIn();
    return false;
  }

  function zoomOut(event){
    var _activityBox = $(this).closest('.activity-box');
    var _id = _activityBox.data('trip-id');
    _loadedMaps[_id].zoomOut();
    return false;
  }

  function checkItOut(event){
    var _activityBox = $(this).closest('.activity-box');
    showTripDetails(_activityBox);
    return false;
  }

  function fetchTrip(tripId,done){
    $.getJSON('https://api.outerspatial.com/trips/' + tripId + '.json?expand=true',done);
  }

  function loadTripDetails(tripId){
    var _activityBox = $($('.activity-box').filter(function(){
      return $(this).data('trip-id') == tripId.toString();
    })[0]);
    showTripDetails(_activityBox);
    return false;
  }

  function showTripDetails(_activityBox){
    var _tripDetails = _activityBox.find('.trip-details')
    _currentTripId = _activityBox.data('trip-id');

    if(_currentTripDetails){
      $(_currentTripDetails).slideUp();
    }
    _tripDetails.slideDown(function(){
      CarLess.loadTripMap(_currentTripId);
      $('html, body').animate({
          scrollTop: $(_tripDetails).offset().top
      }, 400);
    });
    _currentTripDetails = _tripDetails;
  }

  function initDestinationPage(destination){
    $('.from-select .selected-item').on('mouseenter',function(){
      $('.from-select .unselected-items').slideDown(200);
    });
    $('.from-select').on('mouseleave',function(){
      $('.from-select .unselected-items').slideUp(200);
    });
    $('.from-select').on('click',function(){
      $('.from-select .unselected-items').slideToggle(200);
    });

    $('.to-select .selected-item').on('mouseenter',function(){
      $('.to-select .unselected-items').slideDown(200);
    });
    $('.to-select').on('mouseleave',function(){
      $('.to-select .unselected-items').slideUp(200);
    });
    $('.to-select').on('click',function(){
      $('.to-select .unselected-items').slideToggle(200);
    });
    $('#activities-content').load('/destinations/activities/' + destination);
    $.getJSON('/destinations/activities/'+destination+'.json',function(data){
      _.each(data,function(item){
        _allTripMap[item['id']] = item;
      })
    });
  }

  function loadTripMap(tripId){
    if(!_loadedMaps[tripId]){
      _map = buildTripMap(tripId);
      _loadedMaps[tripId] = _map;
    }
  }

  function buildTripMap(tripId){
    var _element = 'trip_map_' + tripId;
    // Create a map in the div #map
    var _mapOptions = {
      scrollWheelZoom: false,
      zoomControl: false
    }
    _map = L.mapbox.map(_element,null,_mapOptions);
    _map.addLayer(_baseMaps['Hike']);
    _currentBasemap = _baseMaps['Hike'];
    var _geom = L.geoJson(_allTripMap[tripId].geometry,{
      style: _trailStyle
    });
    var _startPoint = _allTripMap[tripId].starting_trailhead.geometry;
    var _start = L.geoJson(_startPoint, {
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, _startStyle);
      }
    });
    var _endPoint = _allTripMap[tripId].ending_trailhead.geometry;
    var _end = L.geoJson(_endPoint, {
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, _endStyle);
      }
    });
    var _route = L.featureGroup([_geom,_start,_end]).addTo(_map);
    _overLays['route'] = _route;
    _map.fitBounds(_route.getBounds());
    if(tripData()[tripId].properties['region'] == 'yosemite'){
      loadYosemiteOverlays();
    };
    if(tripData()[tripId].properties['region'] == 'south_lake_tahoe'){
      loadTahoeOverlays();
    };

    // _map.setView([43,-111],10);
    return _map;
  }

  function loadYosemiteOverlays(){
    var vizjson = "https://trailheadlabs.cartodb.com/api/v2/viz/ec217aa8-c0bd-11e5-926c-0e3ff518bd15/viz.json"
    cartodb.createLayer(_map, vizjson).on('done', function(layer) {
      _overLays['food'] = layer;
    })
    .on('error', function(err) {
      console.log("some error occurred: " + err);
    });
    var vizjson = 'https://trailheadlabs.cartodb.com/api/v2/viz/4ab2fdf8-c0c3-11e5-a22c-0ecd1babdde5/viz.json';
    cartodb.createLayer(_map, vizjson).on('done', function(layer) {
      _overLays['lodging'] = layer;
    })
    .on('error', function(err) {
      console.log("some error occurred: " + err);
    });
    var vizjson = 'https://trailheadlabs.cartodb.com/api/v2/viz/2e3836dc-c0c5-11e5-9038-0e674067d321/viz.json';
    cartodb.createLayer(_map, vizjson).on('done', function(layer) {
      _overLays['campgrounds'] = layer;
    })
    .on('error', function(err) {
      console.log("some error occurred: " + err);
    });


  }

  function loadTahoeOverlays(){
    var vizjson = "https://trailheadlabs.cartodb.com/api/v2/viz/ec217aa8-c0bd-11e5-926c-0e3ff518bd15/viz.json"
    cartodb.createLayer(_map, vizjson).on('done', function(layer) {
      _overLays['food'] = layer;
      console.log(layer);
    })
    .on('error', function(err) {
      console.log("some error occurred: " + err);
    });

  }

  function openLayerToolbar(event){
    var _activityBox = $(this).closest('.activity-box');
    _activityBox.find('.layer-toolbar').fadeIn(400);
    return false;
  }

  function closeLayerToolbar(event){
    var _activityBox = $(this).closest('.activity-box');
    var _id = _activityBox.data('trip-id');
    var _toolbar = _activityBox.find('.layer-toolbar').fadeOut(400);
    return false;
  }

  function toggleLayer(event){
    $(this).find('.indicator').toggleClass('selected');
    var _name = $(this).data('name');
    var layer = _overLays[_name];
    if (_map.hasLayer(layer)) {
      _map.removeLayer(layer);
    } else {
      _map.addLayer(layer);
    }
    return false
  }

  function toggleAdditionalInfo(event){
    $('.container.additional-information-content').slideToggle();
    $('.additional-info-container').toggleClass('open');
    return false;
  }

  CarLess.init = init;
  CarLess.loadTripMap = loadTripMap;
  CarLess.tripData = tripData;
  CarLess.loadTripDetails = loadTripDetails;
  CarLess.initDestinationPage = initDestinationPage;

  return CarLess;

})(CarLess || {});
