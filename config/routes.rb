Rails.application.routes.draw do
  root to: 'destinations#index'
  get "/destinations/trip_ids" => 'destinations#trip_ids'
  get "/yosemite" => 'high_voltage/pages#show', id: 'yosemite'
  get "/to/:id(/from/:from)" => "high_voltage/pages#show", as: :to
  get "/index/featured_trip" => "application#featured_trip"
  get "/destinations/activity/:id" => "application#activity"
  get "/destinations/activities/:id" => "destinations#activities"
end
