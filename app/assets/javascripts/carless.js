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
  var  _trailStyle = {
      stroke: true,
      color: "#3E6D92",
      opacity: 1.0,
      weight: 5,
      lineCap: 'round',
      dashArray: "6,10"
    };



  function init(){
    L.mapbox.accessToken = 'pk.eyJ1IjoidHJhaWxoZWFkbGFicyIsImEiOiJzN29LeEU4In0.3tl1HARqdU8DYUPq064kyw';
    initBasemaps();
    $('body').on('click','.check-it-out-button',checkItOut);
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
  }

  function setBasemap(event){
    var _name = $(this).data('name');
    var layer = _baseMaps[_name];
    if (_map.hasLayer(layer)) {
      _map.removeLayer(layer);
    } else {
      _map.addLayer(layer);
    }
    return false;
  }

  function tripData(){
    return _allTripMap;
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
    $('#activities-content').load('/destinations/activities/yosemite');
    $.getJSON('/destinations/activities/yosemite.json',function(data){
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
    var _map = L.mapbox.map(_element, 'trailheadlabs.63dd9d04',_mapOptions);
    var _route = L.geoJson(_allTripMap[tripId].geometry,{
      style: _trailStyle
    }).addTo(_map);
    _map.fitBounds(_route.getBounds());
    // _map.setView([43,-111],10);
    return _map;
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
