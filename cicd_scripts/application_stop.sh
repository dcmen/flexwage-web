# sudo env PATH=$PATH:/usr/local/bin /usr/local/lib/node_modules/pm2/bin/pm2 unstartup systemd -u ec2-user --hp /home/ec2-use
set -x
cd /etc/profile.d/
. /etc/profile.d/env.sh

pm2 update  # if the server is manually restatred, this is necessary to sync with previous pm2 services to avoid subsequent errors

# # stop pm2 cashd-web-admin service only if the application is already running
if [[ $(/usr/local/bin/pm2 status | grep cashd-web-admin) ]] 
then
    /usr/local/bin/pm2 stop "cashd-web-admin-${TYPE}-${PORT}"
    /usr/local/bin/pm2 delete "cashd-web-admin-${TYPE}-${PORT}"
fi