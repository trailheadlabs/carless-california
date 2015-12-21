"use strict";

var CarLess = (function(CarLess){
  var _featuredTripId = 1;
  var _tripIds = [];
  var _currentTrip;
  function init(){
    $('body').on('click','.check-it-out-button',checkItOut);
  }

  function checkItOut(event){
    var _tripDetails = $(this).closest('.activity-box').find('.trip-details')
    if(_currentTrip){
      $(_currentTrip).slideUp();
    }
    _tripDetails.slideDown(function(){
      $('html, body').animate({
          scrollTop: $(_tripDetails).offset().top
      }, 400);
    });
    _currentTrip = _tripDetails;
  }

  CarLess.init = init;
  return CarLess;

})(CarLess || {});
