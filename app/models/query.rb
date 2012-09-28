class Query
  include Mongoid::Document
  include Mongoid::Timestamps
  belongs_to :asker
  belongs_to :expert

  field :sessionId, :type => String
  field :text, :type => String
  field :keywords, :type => Array, :default => []
  field :httpresponse, :type => String
  field :geo_lat, :type => String
  field :geo_lng, :type => String
  field :city_location, :type => String
  field :public, :type => Boolean

  after_create :get_keywords, :set_asker_location

  def get_keywords
    self.text = self.text + '?'
  	if self.keywords.empty? and self.text.split(/[^a-zA-Z]/).count > 1
  		results = AlchemyAPI.search(:keyword_extraction, :text => self.text)
  		self.httpresponse = results
			results.each do |kw|
				self.keywords.push(kw['text'])
			end
			if results.count == 0
				self.keywords = self.text.split(/[^a-zA-Z]/)
			end
  	elsif self.keywords.empty? and self.text.split(/[^a-zA-Z]/).count == 1
  		self.keywords.push(self.text)
  	end
  	self.save
  end

  def set_asker_location
    #maybe i;d like to maintain some record of prior locations
    self.asker.update_attribute(:location, [self.geo_lat.to_f, self.geo_lng.to_f])
  end

  def state
  	if expert and asker
  		self.update_attribute(:public, false)
  		"occupied"
  	elsif asker
  		"waiting for expert"
		elsif expert
  		"waiting for asker"
  	else
  		"unoccupied"
  	end
  end


end