set -x
# This starts a pm2 process by the name cashd-web-admin-{dev/test/prod}-{4000/5000/3000}
cd /etc/profile.d/
. /etc/profile.d/env.sh

pm2 update  # if the server is manually restatred, this is necessary to sync with previous pm2 services to avoid subsequent errors

# # stop pm2 cashd-web-admin service only if the application is already running
if [[ $(/usr/local/bin/pm2 status | grep cashd-web-admin) ]] 
then
    /usr/local/bin/pm2 stop "cashd-web-admin-${TYPE}-${PORT}"
    /usr/local/bin/pm2 delete "cashd-web-admin-${TYPE}-${PORT}"
fi

# /usr/local/bin/pm2 unstartup



#transfer static files from application public folder to EFS public folder
cd $APPS_FOLDER/cashd-web-admin
cp -r ./public/* ../public_shared_files/
rm -rf ./public/*

#commented out installation of logrotate, because this should already be installed
#during server instatiation. This line hangs intermittently.
#/usr/local/bin/pm2 install pm2-logrotate
/usr/local/bin/pm2 set pm2-logrotate:rotateInterval '0 0 * * *'

npm install --prefer-offline &> /dev/null

export PM2LOG_API="--output /var/log/pm2/cashd-mobile-api.log --error /var/log/pm2/cashd-mobile-api.err.log"
export PM2LOG_WEB="--output /var/log/pm2/cashd-web-admin.log --error /var/log/pm2/cashd-web-admin.err.log"

/usr/local/bin/pm2 start bin/www -f --name "cashd-web-admin-${TYPE}-${PORT}" $PM2LOG_WEB


# /usr/local/bin/pm2 startup
# env PATH=$PATH:/usr/local/bin /usr/local/bin/pm2 startup systemd -u ec2-user --hp $WEB_ADMIN_SERVER
# /usr/local/bin/pm2 save