#!/bin/bash
echo > templates.html
for template in templates/html/*.gohtml; do
    templatename=`echo $template | awk '{ print substr($1, 16, length($1) - 22 ) }'`
    echo -n '<script type="text/html" class="template" id="template-'$templatename'">' >> templates.html
    cat $template | sed "s/^/  /g" >> templates.html
    echo -e "</script>\n" >> templates.html
done

cp templates/html/index.html index.html
