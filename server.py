'''
flask-tweepy-oauth

an example showing how to authorize a twitter application
in python with flask and tweepy.

find me on github at github.com/whichlight
see my other projects at whichlight.com

KAWAN!
'''

from flask import Flask, session
from flask import request
import flask 
import tweepy
from tweepy.auth import OAuthHandler
app = Flask(__name__)

#config
	
CONSUMER_TOKEN='p8ZtSYnB74NRAMPmis8qBk71l'
CONSUMER_SECRET='yEQaGmRFWmpoRlmsQTfcUVKzC1FHsry613xV4Bb8exshf36wPr'
CALLBACK_URL = 'http://localhost:5000/verify'
# session = dict()
db = dict() #you can save these values to a database

# set the secret key.  keep this really secret:
app.secret_key = 'A0Zr98j/3yX R~XHH!jmN]LWX/,?RT'

@app.route("/")
def send_token():
	auth = OAuthHandler(CONSUMER_TOKEN, CONSUMER_SECRET, CALLBACK_URL)
	print 'hola'
	try: 
		#get the request tokens
		redirect_url= auth.get_authorization_url()
		print(redirect_url)
		session['request_token'] = auth.request_token
		print 'se guardo en la sesion'
		if 'request_token' in session:
		    user = session['request_token']
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
	token = session.get('request_token')
	session.clear()
	
	auth.request_token = token


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
	db['api']=api
	db['access_token_key']=auth.access_token
	db['access_token_secret']=auth.access_token_secret
	return flask.redirect(flask.url_for('start'))

@app.route("/start")
def start():
	#auth done, app logic can begin
	api = db['api']

	#example, print your latest status posts
	return flask.render_template('tweets.html', tweets=api.user_timeline())

if __name__ == "__main__":
	app.run()
