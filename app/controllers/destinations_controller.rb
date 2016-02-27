class DestinationsController < ApplicationController

  def trip_photos
    _images = JSON.load(open("http://api.outerspatial.com/v0/trips/#{params[:trip_id]}/images"))
    trip = {'images'=>_images['data']}
    trip_id = params[:trip_id]
    render partial: "/pages/trip_photos", locals: {trip:trip,trip_id:trip_id}
  end

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
        trip['ending_trailhead'] = Rails.cache.fetch(['trailhead',trip['ending_trailhead_id']],expires_in:60) do
          begin
            JSON.load(open("http://api.outerspatial.com/v0/trailheads/#{trip['ending_trailhead_id']}.json"))
          rescue
            nil
          end
        end
        # if there is no ending trailhead then set it to the starting trailhead
        trip['ending_trailhead'] ||= trip['starting_trailhead']
        trip['properties'] = {}
        trip['application_properties'].each{|p| trip['properties'][p['key']] = p['value']}
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

end
