"use strict";

var CarLess = (function(CarLess){
  var _featuredTripId = 1;
  var _tripIds = [];
  var _currentTripId;
  var _currentTripDetails;
  var _loadedMaps = {};
  var _baseMaps = {};
  var _map;


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
    console.log(window.location.search);
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

  function loadTripMap(tripId){
    if(!_loadedMaps[tripId]){
      var _element = 'trip_map_' + tripId;
      // Create a map in the div #map
      var _mapOptions = {
        scrollWheelZoom: false,
        zoomControl: false
      }
      _map = L.mapbox.map(_element, 'trailheadlabs.63dd9d04',_mapOptions);
      _map.setView([43,-111],10);
      _loadedMaps[tripId] = _map;
    }
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
  CarLess.loadTripDetails = loadTripDetails;

  return CarLess;

})(CarLess || {});
