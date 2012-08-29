class Room
  include Mongoid::Document
  include Mongoid::Timestamps

  field :name, :type => String
  field :sessionId, :type => String
  field :public, :type => Boolean, :default => false
end
