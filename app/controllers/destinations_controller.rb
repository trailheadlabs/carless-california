class DestinationsController < ApplicationController

  def activities
    @trip_ids = [1250]
    @trips = []
    @trip_ids.each do |id|
      trip = Rails.cache.fetch(['trip',id], expires_in: 600) do
        JSON.load(open("http://api.outerspatial.com/v0/trips/#{id}.json"))
      end
      photos = Rails.cache.fetch(['trip',id,'photos'], expires_in: 600) do
        JSON.load(open("http://api.outerspatial.com/v0/trips/#{id}/images.json"))
      end
      trip['photos'] = photos
      trip['starting_trailhead'] = Rails.cache.fetch(['trailhead',id],expires_in:600) do
        JSON.load(open("http://api.outerspatial.com/v0/trailheads/#{trip['starting_trailhead_id']}.json"))
      end
      trip['ending_trailhead'] = Rails.cache.fetch(['trailhead',id],expires_in:600) do
        JSON.load(open("http://api.outerspatial.com/v0/trailheads/#{trip['ending_trailhead_id']}.json"))
      end
      @trips << trip
    end
    respond_to do |format|
      format.html do
        render layout: false
      end
      format.json do
        render json: @trips
      end
    end

  end

  def south_lake_tahoe
  end
end
