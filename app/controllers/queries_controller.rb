class QueriesController < ApplicationController
  before_filter :require_user, :only => [:create, :show]

  def require_user
    if not current_user
      flash[:notice] = "You'll need to login or register to do that"
      @user_session ||= Session.new
      if params[:query]
        session[:last_query] = params[:query]
      end
      respond_to do |format|
        format.html {render :template => 'sessions/new'}
        format.js {
          render :template => 'sessions/new', :layout => false
        }
      end
    else
      #session[:last_query] = nil
    end
  end


  # POST /queries
  # POST /queries.json
  def create
    config_opentok
    session = @opentok.create_session request.remote_addr
    params[:query][:sessionId] = session.session_id

    @query = Query.new(params[:query])

    respond_to do |format|
      if @query.save
        format.html { redirect_to @query, notice: 'Query was successfully created.' }
        format.json { render json: @query, status: :created, location: @query }
      else
        format.html { render action: "new" }
        format.json { render json: @query.errors, status: :unprocessable_entity }
      end
    end
  end

  # GET /queries
  # GET /queries.json
  def index
    @queries = Query.all.order_by([:updated_at, :asc])

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @queries }
    end
  end

  # GET /queries/1
  # GET /queries/1.json
  def show
    @query = Query.find(params[:id])
    config_opentok
    @tok_token = @opentok.generate_token :session_id =>
          @query.sessionId
    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @query }
    end
  end

  # GET /queries/new
  # GET /queries/new.json
  def new
    @query = Query.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @query }
    end
  end

  # GET /queries/1/edit
  def edit
    @query = Query.find(params[:id])
  end

  # PUT /queries/1
  # PUT /queries/1.json
  def update
    @query = Query.find(params[:id])

    respond_to do |format|
      if @query.update_attributes(params[:query])
        format.html { redirect_to @query, notice: 'Query was successfully updated.' }
        format.json { head :ok }
      else
        format.html { render action: "edit" }
        format.json { render json: @query.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /queries/1
  # DELETE /queries/1.json
  def destroy
    @query = Query.find(params[:id])
    @query.destroy

    respond_to do |format|
      format.html { redirect_to queries_url }
      format.json { head :ok }
    end
  end

  private
  def config_opentok
    if @opentok.nil?
      @opentok = OpenTok::OpenTokSDK.new OPENTOK_KEY, OPENTOK_SECRET
    end
  end
end
