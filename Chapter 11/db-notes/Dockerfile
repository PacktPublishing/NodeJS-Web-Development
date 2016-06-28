FROM mysql:5.7

ENV MYSQL_RANDOM_ROOT_PASSWORD=yes
ENV MYSQL_DATABASE=notes
ENV MYSQL_USER=notes
ENV MYSQL_PASSWORD=notes

RUN sed -i "s/^#bind-address.*$/bind-address = 0.0.0.0/" /etc/mysql/my.cnf
RUN sed -i "s/^pid-file/# pid-file/" /etc/mysql/my.cnf
RUN sed -i "s/^socket/# socket/" /etc/mysql/my.cnf

VOLUME /var/lib/mysql

EXPOSE 3306
CMD ["mysqld"]
