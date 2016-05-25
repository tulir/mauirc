#!/bin/bash
htmlminify() {
    html-minifier --html-5 \
        --collapse-boolean-attributes \
        --collapse-inline-tag-whitespace \
        --collapse-whitespace \
        --remove-attribute-quotes \
        --remove-comments \
        --remove-redundant-attributes \
        --remove-script-type-attributes \
        --remove-style-link-type-attributes \
        --use-short-doctype
}

minifyappend() {
    echo -n '<script type="text/html" id="template-'$1'"> ' >> templates.min.html
    cat "templates/$1.html" | htmlminify >> templates.min.html
    echo -n "</script>" >> templates.min.html
}

echo > templates.min.html
minifyappend action
minifyappend channel-adder
minifyappend channel-switcher
minifyappend login
minifyappend main
minifyappend settings
minifyappend script-list-entry
minifyappend message
minifyappend message-preview-both
minifyappend message-preview-image
minifyappend message-preview-text
minifyappend network-switcher
minifyappend whois
minifyappend invite
minifyappend rawio
cat "templates/misc.html" | htmlminify >> templates.min.html

if [ ! -f index.max.html ]; then
    mv index.html index.max.html
fi

cat index-min.html | html-minifier --html-5 --collapse-boolean-attributes --collapse-inline-tag-whitespace --collapse-whitespace --remove-attribute-quotes --remove-redundant-attributes --remove-script-type-attributes --remove-style-link-type-attributes > index.html
