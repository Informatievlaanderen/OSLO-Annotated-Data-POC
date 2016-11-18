# This is a comment
FROM richarvey/nginx-php-fpm:php7
MAINTAINER Thomas Ghysels <thomas@weconnectdata.com>

COPY admin /var/www/html/admin/
COPY example /var/www/html/example/files/

# Define mountable directories.
# VOLUME ["/etc/nginx/sites-enabled", "/etc/nginx/certs", "/etc/nginx/conf.d", "/var/log/nginx", "/var/www/html"]

# Define working directory.
# WORKDIR /var/www/html
