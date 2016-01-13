module ApplicationHelper

  def human_trip_length(trip)
    (Float(trip['length'])/1609.34).round(1).to_s + " mi"
  end

end
