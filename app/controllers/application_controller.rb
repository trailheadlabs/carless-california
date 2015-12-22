require 'open-uri'

class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  def featured_trip
    @featured_trip = JSON.load(open('http://api.outerspatial.com/v0/trips/1250.json'))
    render partial: '/pages/featured_trip', locals:{trip:@featured_trip}
  end

  def activity
    id = params[:id]
    trip = JSON.load(open("http://api.outerspatial.com/v0/trips/#{id}.json"))
    photos = JSON.load(open("http://api.outerspatial.com/v0/trips/#{id}/images.json"))
    trip['photos'] = photos
    render partial: '/pages/activity', locals:{trip:trip,trip_id:id}
  end

end
