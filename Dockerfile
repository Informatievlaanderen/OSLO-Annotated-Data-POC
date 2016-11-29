FROM richarvey/nginx-php-fpm:php7
MAINTAINER Thomas Ghysels <thomas@weconnectdata.com>

COPY admin /var/www/html/admin/
COPY example /var/www/html/example/
COPY index.html /var/www/html/index.php

RUN mkdir /var/password \
 && echo 'admin:$apr1$sbVa5ypM$8ih5Bc.5/CvI6mMmMRCkz/' > /var/password/.htpasswd \
 && sed -i "s/location \//location \/admin { auth_basic \"Restricted Content\"; auth_basic_user_file \/var\/password\/.htpasswd; } location \//g" /etc/nginx/sites-available/default.conf

# Define mountable directories.
# VOLUME ["/etc/nginx/sites-enabled", "/etc/nginx/certs", "/etc/nginx/conf.d", "/var/log/nginx", "/var/www/html"]

# Define working directory.
# WORKDIR /var/www/html
