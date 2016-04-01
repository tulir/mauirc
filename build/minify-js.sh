#!/bin/bash
cat \
    ./js/lib/jquery.modal.min.js \
    ./js/lib/linkify.min.js \
    ./js/lib/linkify-html.min.js \
    ./js/lib/linkify-jquery.min.js \
    ./js/vars.js \
    ./js/util.js \
    ./js/channels.js \
    ./js/userlist.js \
    ./js/messaging.js \
    ./js/settings.js \
    ./js/mauirc.js \
    ./js/auth.js \
    ./js/load.js \
    > ./index.js

uglifyjs -cmo index.min.js -- index.js
