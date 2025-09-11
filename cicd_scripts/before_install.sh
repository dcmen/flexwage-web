set -x
cd /usr/local/share/applications/
# make application directory if it does not exist
mkdir -p cashd-web-admin

rm -rf cashd-web-admin	# removes any leftover hidden files from previous deployment
mkdir -p cashd-web-admin

cd cashd-web-admin

# CodeDepoly need to make sure the environmental variables are loaded before it can go ahead with the deploy.
ENV_FILE=/etc/profile.d/env.sh
#COMPLETION_TEXT="echo Finished loading CashD application parameters. Session starting.."
#
#for i in 1 2 3 4 5
#do
#    if grep -Fxq "$COMPLETION_TEXT" $ENV_FILE; then
#        echo "$FILE exists and complete."
#    else
#        echo "Waiting for $FILE to exist."
#        sleep 1m
#    fi
#done
#
#if grep -Fxq "$COMPLETION_TEXT" $ENV_FILE; then
#    echo "$FILE exists. We are good to deploy"
#else
#    raise error "$FILE does not exist or ready yet, so env unable to load."
#fi

