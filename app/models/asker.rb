class Asker
  include Mongoid::Document
  belongs_to :user
  has_many :queries
  field :location, :type => Array, :default => [0, 0]

end
