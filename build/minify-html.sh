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
minifyappend joinpart
minifyappend login
minifyappend main
minifyappend message
minifyappend network-switcher
minifyappend nickchange
cat "templates/misc.html" | htmlminify >> templates.min.html

if [ ! -f index.max.html ]; then
    mv index.html index.max.html
fi

cat index-min.html | htmlminify > index.html
