class DestinationsController < ApplicationController

  def activities
    @trip_ids = [1250]
    @trips = []
    @trip_ids.each do |id|
      trip = JSON.load(open("http://api.outerspatial.com/v0/trips/#{id}.json"))
      photos = JSON.load(open("http://api.outerspatial.com/v0/trips/#{id}/images.json"))
      trip['photos'] = photos
      trip['starting_trailhead'] = JSON.load(open("http://api.outerspatial.com/v0/trailheads/#{trip['starting_trailhead_id']}.json"))
      trip['ending_trailhead'] = JSON.load(open("http://api.outerspatial.com/v0/trailheads/#{trip['ending_trailhead_id']}.json"))
      @trips << trip
    end
    render layout: false
  end

  def south_lake_tahoe
  end
end
