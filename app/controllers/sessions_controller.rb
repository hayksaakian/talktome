class SessionsController < ApplicationController
	def authenticate
	  current_user = User.authenticate(params[:email], params[:password])
	  if logged_in?
	    if params[:remember_me] == "1"
	       current_user.remember_me unless current_user.remember_token?
	       cookies[:auth_token] = { :value => current_user.remember_token, 
	         :expires => current_user.remember_token_expires_at }
	    end
	  end
	end

	def require_user
	  unless current_user
	    flash[:notice] = "You'll need to login or register to do that"
	    @user_session ||= Session.new
	    respond_to do |format|
	      format.html {render :template => 'sessions/new'}
	      format.js {
	        render :template => 'sessions/new', :layout => false
	      }
	    end
	  end
	end

	def new
	end

	def create
	  user = User.authenticate(params[:email], params[:password])
	  if user
	    session[:user_id] = user.id
		  if session[:last_query]
		  	redirect_to queries_path, :query => session[:last_query]
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
