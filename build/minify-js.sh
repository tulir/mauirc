#!/bin/bash
echo > index.js
for script in
    lib/linkify.min lib/linkify-html.min \
    data vars util channels \
    autocomplete userlist \
    messaging contextmenus \
    settings modal whois oper \
    rawio scripts mauirc auth \
    keybinds load
do cat js/$script >> index.js done

uglifyjs -cmo index.min.js -- index.js
