class Asker
  include Mongoid::Document
  belongs_to :user
  has_many :queries
  
  #should it have this field at all? considering the query and user both have a location
  field :location, :type => Array, :default => [0, 0]

end
