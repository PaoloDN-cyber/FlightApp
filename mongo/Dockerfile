FROM mongo:6

COPY init-mongo.js /docker-entrypoint-initdb.d/

# Sovrascrivi il comando di default per forzare il bind su 0.0.0.0
CMD ["mongod", "--bind_ip_all"]