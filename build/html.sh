#!/bin/bash
echo > templates.html
for template in templates/*.gohtml; do
    [[ $template == "templates/index.gohtml" ]] && continue
    templatename=`echo $template | awk '{ print substr($1, 11, length($1) - 17 ) }'`
    echo -n '<script type="text/html" class="template" id="template-'$templatename'"> ' >> templates.html
    cat $template >> templates.html
    echo -n "</script>" >> templates.html
done
