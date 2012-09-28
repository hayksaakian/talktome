class Expert
  include Mongoid::Document
  belongs_to :user
  has_many :queries
  field :resume, :type => String
  field :qualifications, :type => Array, :default => []
  field :raw_response, :type => Hash

  field :ip_address, :type => String

  after_create :get_qualifications

  def get_qualifications
  	if self.qualifications.empty? and self.resume.split(/[^a-zA-Z]/).count > 1
  		jhash = AlchemyAPI.search(:keyword_extraction, :text => self.resume)
  		self.raw_response = jhash 
			jhash.each do |kw|
				self.qualifications.push(kw['text'])
			end
			if jhash.count == 0
				self.qualifications = self.resume.split(/[^a-zA-Z]/)
			end
  	elsif self.qualifications.empty? and self.resume.split(/[^a-zA-Z]/).count == 1
  		self.qualifications.push(self.resume)
  	end
    self.save #needed since i moved it to the after_create callback
  	#self.save #not needed since this is being called before_save
  end
end
