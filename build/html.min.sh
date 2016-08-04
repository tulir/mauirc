#!/bin/bash
echo > templates.min.html
for template in templates/*.html; do
    [[ $template == "templates/index.html" ]] && continue
    templatename=`echo $template | awk '{ print substr($1, 11, length($1) - 15 ) }'`
    echo -n '<script type="text/html" id="template-'$templatename'"> ' >> templates.min.html
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
  rm -f index.html
  mv index.max.html index.html
fi

cat index.html | html-minifier \
        --html5 --collapse-boolean-attributes --collapse-inline-tag-whitespace \
        --collapse-whitespace --remove-attribute-quotes --remove-redundant-attributes \
        --remove-script-type-attributes --remove-style-link-type-attributes \
    > index.html
