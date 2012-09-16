class Expert
  include Mongoid::Document
  belongs_to :user
  has_many :queries
  field :location, :type => Array, :default => [0, 0]
  field :resume, :type => String
  field :qualifications, :type => Array, :default => []
  field :httpresponse, :type => String

  field :ip_address, :type => String

  before_save :get_qualifications

  def get_qualifications
  	if self.qualifications.empty? and self.resume.split(/[^a-zA-Z]/).count > 1
  		jhash = AlchemyAPI.search(:keyword_extraction, :text => self.resume)
  		self.httpresponse = response.body
			jhash.each do |kw|
				self.qualifications.push(kw['text'])
			end
			if jhash.count == 0
				self.qualifications = self.resume.split(/[^a-zA-Z]/)
			end
  	elsif self.qualifications.empty? and self.resume.split(/[^a-zA-Z]/).count == 1
  		self.qualifications.push(self.resume)
  	end
  	#self.save #not needed since this is being called before_save
  end
end
