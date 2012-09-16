class UsersController < ApplicationController
	def new
	  @user = User.new
	end

	def create
	  @user = User.new(params[:user])
	  if @user.save
	    flash[:notice] = "Signed up!"
	  else
	    flash[:notice] = "Signing up went wrong!"
	  end
	end

	def edit
	  @user = current_user
	end
end
