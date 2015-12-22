"use strict";

var CarLess = (function(CarLess){
  var _featuredTripId = 1;
  var _tripIds = [];
  var _currentTrip;
  var _loadedMaps = {};

  function init(){
    L.mapbox.accessToken = 'pk.eyJ1IjoidHJhaWxoZWFkbGFicyIsImEiOiJzN29LeEU4In0.3tl1HARqdU8DYUPq064kyw';
    $('body').on('click','.check-it-out-button',checkItOut);
    $('body').on('click','.zoom-in-btn',zoomIn);
    $('body').on('click','.zoom-out-btn',zoomOut);
    $('body').on('click','.layer-toolbar-btn',openLayerToolbar);
    $('body').on('click','.layer-toolbar-close-btn',closeLayerToolbar);
    $('body').on('click','.layer-item',toggleLayer);
    $('body').on('click','.additional-info-container',toggleAdditionalInfo);
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
    var _tripDetails = _activityBox.find('.trip-details')
    var _id = _activityBox.data('trip-id');
    if(_currentTrip){
      $(_currentTrip).slideUp();
    }
    _tripDetails.slideDown(function(){
      CarLess.loadTripMap(_id);
      $('html, body').animate({
          scrollTop: $(_tripDetails).offset().top
      }, 400);
    });
    _currentTrip = _tripDetails;
    return false;
  }

  function loadTripMap(tripId){
    if(!_loadedMaps[tripId]){
      var _element = 'trip_map_' + tripId;
      // Create a map in the div #map
      var _mapOptions = {
        scrollWheelZoom: false,
        zoomControl: false
      }
      var _map = L.mapbox.map(_element, 'trailheadlabs.63dd9d04',_mapOptions);
      _map.setView([43,-111],15);
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
    return false
  }

  function toggleAdditionalInfo(event){
    $('.container.additional-information-content').slideToggle();
    $('.additional-info-container').toggleClass('open');
    return false;
  }

  CarLess.init = init;
  CarLess.loadTripMap = loadTripMap;

  return CarLess;

})(CarLess || {});
