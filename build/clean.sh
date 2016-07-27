#!/bin/bash
rm -f index.min.js index.js index.min.css index.css templates.min.html mauirc.tar.xz
[[ -f index.max.html ]] && mv -f index.max.html index.html
exit 0
