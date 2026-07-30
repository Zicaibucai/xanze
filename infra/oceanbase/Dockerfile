ARG OCEANBASE_VERSION=4.3.5-lts
FROM oceanbase/oceanbase-ce:${OCEANBASE_VERSION}

COPY start-persistent.sh /usr/local/bin/start-persistent.sh
RUN chmod 0755 /usr/local/bin/start-persistent.sh

ENTRYPOINT ["bash", "-c", "/usr/sbin/sshd && exec /usr/local/bin/start-persistent.sh"]
