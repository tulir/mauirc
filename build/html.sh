#!/bin/bash
echo > templates.html
for template in html/*.gohtml; do
    templatename=`echo $template | awk '{ print substr($1, 6, length($1) - 12 ) }'`
    echo -n '<script type="text/html" class="template" id="template-'$templatename'">' >> templates.html
    cat $template | html-minifier --html5 --remove-comments | sed "s/^/  /g" >> templates.html
    echo -e "</script>\n" >> templates.html
done
