#!/bin/bash
for template in templates/*.html; do
    [[ $template == "templates/index.html" ]] && continue
    echo -n '<script type="text/html" id="template-'$template'"> ' >> templates.min.html
    cat $template | html-minifier --html5 \
        --collapse-boolean-attributes \
        --collapse-inline-tag-whitespace \
        --collapse-whitespace \
        --remove-attribute-quotes \
        --remove-comments \
        --remove-redundant-attributes \
        --remove-script-type-attributes \
        --remove-style-link-type-attributes \
        --use-short-doctype >> templates.min.html
    echo -n "</script>" >> templates.min.html
done

if [ ! -f index.max.html ]; then
    mv index.html index.max.html
fi

cat index-min.html | html-minifier \
        --html5 --collapse-boolean-attributes --collapse-inline-tag-whitespace \
        --collapse-whitespace --remove-attribute-quotes --remove-redundant-attributes \
        --remove-script-type-attributes --remove-style-link-type-attributes \
    > index.html
