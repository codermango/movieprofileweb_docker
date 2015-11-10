FROM ubuntu

# make sure apt is up to date
RUN apt-get update

# install nodejs and npm
RUN apt-get install -y nodejs-legacy npm git git-core

ADD . /code

WORKDIR /code

RUN     sudo npm install -g bower 
RUN     sudo npm install -g grunt-cli
RUN     sudo npm install 
RUN     sudo bower install --allow-root
#EXPOSE  9000
#RUN     grunt 
#RUN     grunt serve
