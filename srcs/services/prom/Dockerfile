FROM prom/prometheus

COPY ./tools/prometheus.yml /etc/prometheus/prometheus.yml

COPY ./tools/rules.yml /etc/prometheus/rules.yml

ENTRYPOINT ["/bin/prometheus"]

CMD ["--config.file=/etc/prometheus/prometheus.yml", "--storage.tsdb.path=/prometheus","--storage.tsdb.retention.time=30d","--storage.tsdb.retention.size=50GB"]