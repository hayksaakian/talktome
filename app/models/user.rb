class User
  include Mongoid::Document
  attr_accessible :email, :password, :password_confirmation, :asker, :expert, :location
  has_one :expert
  has_one :asker

  field :account_type, :type => String
  field :location, :type => Array, :default => [0, 0]
  field :email, :type => String
  field :password_hash, :type => String
  field :password_salt, :type => String

  attr_accessor :password
  before_save :encrypt_password

  validates :password, :confirmation => true
  validates :password, :presence => true, :on => :create
  validates :email, :presence => true
  validates :email, :uniqueness => true
  
  def self.authenticate(email, password)
  	user = User.first(conditions: { email: email })
    #user = find_by_email(email)
    if user && user.password_hash == BCrypt::Engine.hash_secret(password, user.password_salt)
      user
    else
      nil
    end
  end
  
  def encrypt_password
    if password.present?
      self.password_salt = BCrypt::Engine.generate_salt
      self.password_hash = BCrypt::Engine.hash_secret(password, password_salt)
    end
  end
end
