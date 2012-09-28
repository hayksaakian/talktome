class ApplicationController < ActionController::Base
  protect_from_forgery

  helper_method :current_user, :require_user

	private
	def current_user
	  @current_user ||= User.find(session[:user_id]) if session[:user_id]
	end

  def require_user
    if not current_user
      flash[:notice] = "You'll need to login or register to do that"
      if params[:query]
        session[:last_query] = params[:query]
      end
      respond_to do |format|
        format.html {render :template => 'sessions/new', notice: "FROM HTML: You'll need to login or register to do that"}
        format.js {
          render :template => 'sessions/new', notice: "FROM JS: You'll need to login or register to do that"
        }
      end
    else
      #session[:last_query] = nil
    end
  end
end
