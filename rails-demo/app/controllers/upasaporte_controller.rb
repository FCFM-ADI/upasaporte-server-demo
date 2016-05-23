require 'SecureRandom'
require 'net/http'
require 'json'

class UpasaporteController < ApplicationController
  DATA_PROVIDER = 'https://www.u-cursos.cl/upasaporte/?servicio=demo&ticket=%s'
  REDIRECT_URL = 'http://YOUR_SERVER_URL/upasaporte/authenticated?sessid='
  @@SESSIONS = {} #In production you should use a better session system than this one in
  def external
    data = Net::HTTP.get(URI(sprintf(DATA_PROVIDER, params[:ticket])))
    if not data or not data['pers_id']
      render :text => 'error', :status => 400
      return
    end
    uuid = SecureRandom.uuid;
    @@SESSIONS[uuid] = data;
    redirect_url = REDIRECT_URL+uuid
    render text: redirect_url
  end

  def authenticated
    raw_data = @@SESSIONS[params[:sessid]]
    if not @user_data
      render :text => 'error', :status => 400
      return
    end
    @user_data = JSON.parse(raw_data)
  end
end
