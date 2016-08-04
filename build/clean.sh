#!/bin/bash
rm -f index.min.js index.js index.min.css index.css templates.min.html mauirc.tar.xz
if [ ! -f index.max.html ]; then
  rm -f index.html
  mv index.max.html index.html
fi
exit 0
