#!/bin/bash
cat \
    ./js/lib/linkify.min.js \
    ./js/lib/linkify-html.min.js \
    ./js/lib/linkify-jquery.min.js \
    ./js/data.js \
    ./js/vars.js \
    ./js/util.js \
    ./js/channels.js \
    ./js/autocomplete.js \
    ./js/userlist.js \
    ./js/messaging.js \
    ./js/contextmenus.js \
    ./js/settings.js \
    ./js/modal.js \
    ./js/whois.js \
    ./js/oper.js \
    ./js/rawio.js \
    ./js/scripts.js \
    ./js/mauirc.js \
    ./js/auth.js \
    ./js/keybinds.js \
    ./js/load.js \
    > ./index.js

uglifyjs -cmo index.min.js -- index.js
