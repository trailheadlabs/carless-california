Rails.application.routes.draw do
  root to: 'destinations#index'
  get "/yosemite" => 'high_voltage/pages#show', id: 'yosemite'
end
