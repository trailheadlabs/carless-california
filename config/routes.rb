Rails.application.routes.draw do
  root to: 'destinations#index'
  get "/yosemite" => 'high_voltage/pages#show', id: 'yosemite'
  get "/to/:id(/from/:from)" => "high_voltage/pages#show", as: :to
  get "/index/featured_trip" => "application#featured_trip"
  get "/index/activity" => "application#activity"
end
