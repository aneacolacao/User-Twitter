'''
flask-tweepy-oauth

an example showing how to authorize a twitter application
in python with flask and tweepy.

find me on github at github.com/whichlight
see my other projects at whichlight.com

KAWAN!
'''

from flask import Flask, jsonify, render_template, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask import request
import flask
import tweepy
import got
import json
import simplejson as json
import datetime
import jsonpickle

from tweepy.auth import OAuthHandler
app = Flask(__name__)
#app.debug = True
#config
app.config.update(

  DEBUG = True,
  SECRET_KEY = 'A0Zr98j/3yX R~XHH!jmN]LWX/,?RT',
  SQLALCHEMY_DATABASE_URI = 'sqlite:///static/users_first.db', #in memory db. or use sqlite:////absolute/path/to/creeper.db,
  SQLALCHEMY_TRACK_MODIFICATIONS = True
  )

CONSUMER_TOKEN='p8ZtSYnB74NRAMPmis8qBk71l'
CONSUMER_SECRET='yEQaGmRFWmpoRlmsQTfcUVKzC1FHsry613xV4Bb8exshf36wPr'
CALLBACK_URL = 'http://aneacolacao.pythonanywhere.com/verify'

db = SQLAlchemy(app)
session_t = dict()
bdd = dict() #you can save these values to a database

# set the secret key.  keep this really secret:
# app.secret_key = 'A0Zr98j/3yX R~XHH!jmN]LWX/,?RT'

class Users(db.Model):
  id = db.Column(db.Integer, primary_key=True)
  facebook_id = db.Column(db.Integer, nullable=False)
  name = db.Column(db.String(50))

  def __init__(self,facebook_id, name):
    self.facebook_id = facebook_id
    self.name = name
    # return '<User %r>' % self.name

# def save_object(obj, filename):
#     with open(filename, 'wb') as output:
#       pickle.dump(obj, output, pickle.HIGHEST_PROTOCOL)

@app.route('/')
def index():
	return render_template('interactive.html')

@app.route("/login")
def login():
	auth = OAuthHandler(CONSUMER_TOKEN, CONSUMER_SECRET, CALLBACK_URL)
	try:
		#get the request tokens
		redirect_url= auth.get_authorization_url(signin_with_twitter=True)
		print(redirect_url)
		session_t['request_token'] = auth.request_token
		print 'se guardo en la sesion'
		if 'request_token' in session_t:
		    user = session_t['request_token']
		    print user
	except tweepy.TweepError:
		print 'Error! Failed to get request token'

	#this is twitter's url for authentication
	# session['request_token'] = auth.request_token
	return flask.redirect(redirect_url)

@app.route("/verify")
def get_verification():

	#get the verifier key from the request url
	verifier= request.args['oauth_verifier']
	print verifier
	auth = OAuthHandler(CONSUMER_TOKEN, CONSUMER_SECRET)

	auth.request_token = {'oauth_token': request.args.get('oauth_token') ,'oauth_token_secret': request.args.get('oauth_verifier') }

	# token = session['request_token']
	del session_t ['request_token']

	# auth.set_request_token(token[0], token[1])


	try:
		    auth.get_access_token(verifier)
		    print 'obtuve el access token'
		    print auth.access_token
		    print 'obtuve el acces token secret'
		    print auth.access_token_secret
		    print 'termine'
	except tweepy.TweepError:
		    print 'Error! Failed to get access token.'

	#now you have access!
	api = tweepy.API(auth)

	#store in a db
	bdd['api'] = api
	bdd['access_token_key'] = auth.access_token
	bdd['access_token_secret']=auth.access_token_secret
	print bdd
	return flask.redirect(flask.url_for('start'))

@app.route("/start")
def start():

	#auth done, app logic can begin
	api = bdd['api']

	def process_or_store(tuit):
		print json.dumps(tuit)

	# Variable usuario
	user_obj = api.me()
	usuario = user_obj.screen_name
	print usuario

	# Variable fecha creacion de usuario
	inicio = user_obj.created_at
	date_1 = inicio

	# print end_date
	end_date = date_1 + datetime.timedelta(days=15)
	strInicio = inicio.strftime("%Y-%m-%d")
	strEnd = end_date.strftime("%Y-%m-%d")

	tweet = False
	tuit = {}

	def get_tweets(since, until, user):
		try:
			# Example 3 - Get tweets by username and bound dates
			tweetCriteria = got.manager.TweetCriteria().setUsername(user).setSince(since).setUntil(until).setMaxTweets(-1)
			# tweet = got.manager.TweetManager.getTweets(tweetCriteria)[0]
			last_tweet = got.manager.TweetManager.getTweets(tweetCriteria)[-1]

			tuit['tweet_text'] = last_tweet.text
			tuit['tweet_id'] = last_tweet.id
			tuit['tweet_date'] = last_tweet.date
			# print last_tweet.text
			# print last_tweet.id
			# print last_tweet.date
			# print 'hay tweet'
			print tuit
			tweet = True
		except IndexError:
			strInicio = until
			t_until = datetime.datetime.strptime(until, "%Y-%m-%d")
			m_until = t_until + datetime.timedelta(days=15)
			strEnd = m_until.strftime("%Y-%m-%d")
			# print 'no hay tweet'
			# print strInicio
			# print strEnd
			get_tweets(strInicio,strEnd, user)

	while tweet == False:
		get_tweets(strInicio,strEnd, usuario)
		break

	print 'abrio start'
	#example, print your latest status posts
	return render_template('tweets.html',
									username = api.me(),
									data = tuit)

@app.route('/background_process')
def background_process():
	try:
		lang = request.args.get('proglang', 0, type=str)
		if lang.lower() == 'python':
			return jsonify(result='You are wise')
		else:
			return jsonify(result='Try again.')
	except Exception as e:
		return str(e)

#config fb
@app.route('/channel')
def channel():
  return render_template('channel.html')

@app.route('/_get_facebook_login')
def get_facebook_login():
  facebook_id = request.args.get('facebook_id', False, type=int)
  print ('aqui viene el facebook_id')
  print (facebook_id)
  name = request.args.get('name', '', type=str)
  print ('aqui viene el name')
  print (name)
  if facebook_id:
    print('si facebook_id')
    user = Users.query.filter_by(facebook_id=facebook_id).first()
    print ('aqui viene el user')
    print (user)
    # save_object(user, 'users_data .pk1')
    frozen = jsonpickle.encode(user)
    print ('soy frozen')
    print(frozen)
    thawed = jsonpickle.decode(frozen)
    print ('soy thawed')
    print(thawed)
    if not user:
      print('si no user')
      print ('aqui viene un nuevo user')
      user = Users(facebook_id,name)
      print (facebook_id)
      db.session.add(user)
      db.session.commit()
      print('creamos user')
    session['user'] = frozen

    # with open('users_data.pk1', 'rb') as input:
    #   user1 = pickle.load(input)
    #   print('soy pickle')
    #   print(user1.name)
    #   print(user1.facebook_id)

    print (user.name)
    print (user.facebook_id)
    print('si existe user')
    return frozen
  print('no hay user')
  return jsonify(result=1)

@app.route('/post', methods=['POST'])
def post_post():
  data = request.get_json()
  print ('aqui viene la data')
  print (data)
  session['mensaje'] = data
  return json.dumps({'success': True}), 200, {'ContentType': 'application/json'}

@app.route('/post', methods=['GET'])
def post_get():
  user_msj = session['mensaje']
  print('aqui viene el mensaje del usuario')
  print(user_msj)
  return render_template('post.html', mensaje=user_msj)

if __name__ == "__main__":
	app.run()
