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
