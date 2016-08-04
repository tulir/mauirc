#!/bin/bash
echo > templates.html
for template in html/*.gohtml; do
    templatename=`echo $template | awk '{ print substr($1, 11, length($1) - 17 ) }'`
    echo -n '<script type="text/html" class="template" id="template-'$templatename'"> ' >> templates.html
    cat $template | html-minifier --html5 \
        --collapse-boolean-attributes \
        --collapse-inline-tag-whitespace \
        --collapse-whitespace \
        --remove-attribute-quotes \
        --remove-comments \
        --remove-redundant-attributes \
        --remove-script-type-attributes \
        --remove-style-link-type-attributes \
        --use-short-doctype >> templates.html
    echo -n "</script>" >> templates.html
done

cat html/index.html | html-minifier \
        --html5 --collapse-boolean-attributes --collapse-inline-tag-whitespace \
        --collapse-whitespace --remove-attribute-quotes --remove-redundant-attributes \
        --remove-script-type-attributes --remove-style-link-type-attributes \
    > index.html
