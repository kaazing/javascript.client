sudo apt-get install -y git

#npm is installed with nodejs above

curl -sL https://deb.nodesource.com/setup | sudo bash -
sudo apt-get install -y nodejs
sudo npm install -g grunt-cli
sudo npm install -g bower

git clone https://github.com/kaazing/gateway.client.javascript.util.git
cd gateway.client.javascript.util
sudo npm install
grunt
