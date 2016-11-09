# This is a comment
FROM richarvey/nginx-php-fpm:php7
MAINTAINER Thomas Ghysels <thomas@weconnectdata.com>

COPY index.html /var/www/html/index.html
COPY admin /var/www/html/admin/
COPY files /var/www/html/files/
COPY index.html /var/www/html/index.php

# Define mountable directories.
# VOLUME ["/etc/nginx/sites-enabled", "/etc/nginx/certs", "/etc/nginx/conf.d", "/var/log/nginx", "/var/www/html"]

# Define working directory.
# WORKDIR /var/www/html

# Run
# docker run -d    --name oslo -p 81:80 fce567a58bba
# docker run -d -P --name oslo -p 81:80 -v .:/var/www/html richarvey/nginx-php-fpm:php7
# docker run -d --name oslo -p 81:80 -v /Users/thomas/projects/oslo:/var/www/html richarvey/nginx-php-fpm:php7
# docker stop oslo2 && docker rm oslo2 && docker build -t oslo2 . && docker run -d --name oslo2 -p 81:80 oslo2