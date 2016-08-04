#!/bin/bash
echo > templates.html
for template in templates/*.html; do
    [[ $template == "templates/index.html" ]] && continue
    templatename=`echo $template | awk '{ print substr($1, 11, length($1) - 15 ) }'`
    echo -n '<script type="text/html" id="template-'$templatename'"> ' >> templates.html
    cat $template >> templates.html
    echo -n "</script>" >> templates.html
done
