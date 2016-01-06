require 'open-uri'

class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  def featured_trip
    featured_trip_id = 1250;
    @featured_trip = Rails.cache.fetch(['trip',featured_trip_id],expires_id: 60) do
      JSON.load(open("http://api.outerspatial.com/v0/trips/#{featured_trip_id}.json"))
    end
    render partial: '/pages/featured_trip', locals:{trip:@featured_trip}
  end

  def activity
    id = params[:id]
    trip = Rails.cache.fetch(['trip',id],expires_in: 60) do
      JSON.load(open("http://api.outerspatial.com/v0/trips/#{id}.json"))
    end
    photos = Rails.cache.fetch(['trip',id,'photos'],expires_in: 60) do
      JSON.load(open("http://api.outerspatial.com/v0/trips/#{id}/images.json"))
    end
    trip['photos'] = photos
    render partial: '/pages/activity', locals:{trip:trip,trip_id:id}
  end

end
