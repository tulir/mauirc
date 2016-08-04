#!/bin/bash
echo > templates.html
for template in templates/*.gohtml; do
    templatename=`echo $template | awk '{ print substr($1, 11, length($1) - 17 ) }'`
    echo -n '<script type="text/html" class="template" id="template-'$templatename'">' >> templates.html
    cat $template | sed "s/^/  /g" >> templates.html
    echo -e "</script>\n" >> templates.html
done
