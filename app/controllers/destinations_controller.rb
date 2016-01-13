class DestinationsController < ApplicationController

  def activities
    @trips = Rails.cache.fetch(['app_trips',params[:id]],expires_in:60) do
      _page = JSON.load(open("http://api.outerspatial.com/v0/applications/16/trips?expand=true"))
      trips = _page['data']
      pages = _page['total_pages']
      if(pages.to_i>1)
        2.upto pages do |p|
          trips = trips + JSON.load(open("http://api.outerspatial.com/v0/applications/16/trips/#{id}.json?page=#{p}&expand=true"))['data']
        end
      end
      trips.flatten!
      trips.each do |trip|
        trip['starting_trailhead'] = Rails.cache.fetch(['trailhead',trip['starting_trailhead_id']],expires_in:60) do
          JSON.load(open("http://api.outerspatial.com/v0/trailheads/#{trip['starting_trailhead_id']}.json"))
        end
        trip['ending_trailhead'] = Rails.cache.fetch(['trailhead',trip['starting_ending_id']],expires_in:60) do
          JSON.load(open("http://api.outerspatial.com/v0/trailheads/#{trip['ending_trailhead_id']}.json"))
        end
        trip['properties'] = JSON.load(trip['application_properties'].select{|p| p['key'] == 'properties'}[0]['value'])
      end
      trips.select{|t| t['properties']['region'] == params[:id]}            
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
