class SessionsController < ApplicationController
	def new
		@user = User.new
		respond_to do |format|
	      format.html
	      format.js
	    end
	end

	def create
	  user = User.authenticate(params[:email], params[:password])
	  if user
	    session[:user_id] = user.id
		  if session[:last_query]
		  	@query = Query.new(session[:last_query])
		  	@query.asker = current_user.asker
		  	respond_to do |format|
		  		if @query.save		  			
		  			session[:last_query] = nil
		        format.html {	redirect_to @query }
		        format.js { flash[:notice] = "Javascript works, YAY!" }
		      else
		      	format.html {	redirect_to root_url, notice: 'failed at creating a query, after login, with a last_query' }
		      end
	      end
		  else
	    	redirect_to root_url, :notice => "Logged in!"
		  end
	  else
	    flash.now.alert = "Invalid email and password combination"
	    render "new"
	  end
	end

	def destroy
	  session[:user_id] = nil
	  redirect_to root_url, :notice => "Logged out!"
	end
end
