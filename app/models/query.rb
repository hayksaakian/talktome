class Query
  include Mongoid::Document
  has_one :asker
  has_one :expert

  field :sessionId, :type => String
  field :text, :type => String
  field :keywords, :type => Array, :default => []
  field :httpresponse, :type => String
  field :public, :type => Boolean

#  after_create :get_keywords

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

  def state
  	if expert and asker
  		self.update_attribute(public: false)
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