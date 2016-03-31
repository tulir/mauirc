#!/bin/bash
cat \
    ./css/util.css \
    ./css/text.css \
    ./css/alerts.css \
    ./css/login.css \
    ./css/messages.css \
    ./css/messageview.css \
    ./css/channels.css \
    ./css/userlist.css \
    > ./index.css

yui-compressor ./index.css -o ./index.min.css
