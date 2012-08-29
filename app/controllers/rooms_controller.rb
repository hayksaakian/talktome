class RoomsController < ApplicationController

  def index
    @rooms = Room.where(public: true).order_by([:updated_at, :asc])
  end

  def new 
    @room = Room.new
	end

  def create
    config_opentok
    session = @opentok.create_session request.remote_addr
    params[:room][:sessionId] = session.session_id

    @room = Room.new(params[:room])

    respond_to do |format|
      if @room.save
        format.html { redirect_to(@room) }
      else
        format.html { render :controller => 'rooms',
               :action => "index" }
      end
    end
  end

	def edit
		@room = Room.find(params[:id])
	end
	
	def update
		@room = Room.find(params[:id])
		if @room.update_attributes(params[:room])
			redirect_to rooms_path(@room), :notice => "your mess was updated"
		else
			render "edit"
		end

	end

  def destroy
  	@room = Room.find(params[:id])
		@room.destroy
		redirect_to rooms_path, :notice => "thank the lord, your mess is gone from the world"
  end

  def show
    @room = Room.find(params[:id])
    config_opentok
    @tok_token = @opentok.generate_token :session_id =>
          @room.sessionId
  end

  private
  def config_opentok
    if @opentok.nil?
      @opentok = OpenTok::OpenTokSDK.new OPENTOK_AUTH['key'], OPENTOK_AUTH['secret']
    end
  end
end
