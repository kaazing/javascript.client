sudo apt-get install -y git

#npm is installed with nodejs above

curl -sL https://deb.nodesource.com/setup | sudo bash -
sudo apt-get install -y nodejs
sudo npm install -g grunt-cli
sudo npm install -g bower

git clone https://github.com/kaazing/amqp-0-9-1.js.git
cd amqp-0-9-1.js
sudo npm install
grunt
