#!/bin/bash
echo > index.css
for stylesheet in \
    util text alerts login \
    messagetemplates messageview \
    titlebar settings modal \
    whois oper rawio scripts \
    networks channels userlist \
    contextmenu loader 
do cat css/$stylesheet.css >> index.css; done
