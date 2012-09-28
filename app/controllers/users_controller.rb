class UsersController < ApplicationController
	def new
	  @user = User.new
	end

	def create
	  @user = User.new(params[:user])
	  respond_to do |format|
		  if @user.save  	
			  a = Asker.new
			  a.user = @user
			  a.save
		    flash[:notice] = "Signed up!"
		    session[:user_id] = @user.id
	  		if session[:last_query]
					@query = Query.new(session[:last_query])
			  	@query.asker = current_user.asker
		  		if @query.save		  			
		  			session[:last_query] = nil
		        format.html {	redirect_to @query, notice: 'Query created from last_query post user creation, via HTML'}
		        format.js { flash[:notice] = "Javascript works, YAY! AND you have a last_query" }
		      else
		      	format.html {	redirect_to root_url, notice: 'failed at creating a query, after account creation, with an older query' }
		      end
				else
					format.html {redirect_to new_query_path, notice: "via HTML please enable Javascript to make life easier"}
					format.js { redirect_to new_query_path, notice: "Javascript works, YAY!" }
		    end
		  else
	      format.html { render action: "new" }
	      format.json { render json: @user.errors, status: :unprocessable_entity }
		  end
	  end
	end

	def edit
	  @user = current_user
	end

	def index
		if current_user
			if current_user.account_type == 'admin'
				@users = User.all?
				respond_to do |format|
					format.html
					#format.json
					#format.js
				end 
			else
				redirect_to root_url
			end 
		else
			redirect_to root_url
		end
	end

end