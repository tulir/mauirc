#!/bin/bash
cat \
    ./css/lib/jquery.modal.css \
    ./css/util.css \
    ./css/text.css \
    ./css/alerts.css \
    ./css/login.css \
    ./css/messagetemplates.css \
    ./css/messageview.css \
    ./css/titlebar.css \
    ./css/settings.css \
    ./css/modal.css \
    ./css/rawio.css \
    ./css/scripts.css \
    ./css/channels.css \
    ./css/userlist.css \
    > ./index.css

yui-compressor ./index.css -o ./index.min.css
