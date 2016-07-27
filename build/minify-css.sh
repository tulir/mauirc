#!/bin/bash
echo > index.css
for stylesheet in
    util text alerts login \
    messagetemplates messageview \
    titlebar settings modal \
    whois oper rawio scripts \
    channels userlist
do cat css/$stylesheet >> index.css done

cleancss -o index.min.css index.css
