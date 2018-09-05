echo "creating certs folder ..."
mkdir config/cert && cd config/cert

echo "generating certs ..."

openssl genrsa -passout pass:phrase -des3 -out ca.key 4096

openssl req -passin pass:phrase -new -x509 -days 365 -key ca.key -out ca.crt -subj  "/C=CN/ST=Shanghai/L=Shanghai/O=Test/OU=Test/CN=ca"

openssl genrsa -passout pass:phrase -des3 -out server.key 4096

openssl req -passin pass:phrase -new -key server.key -out server.csr -subj  "/C=CN/ST=Shanghai/L=Shanghai/O=Test/OU=Server/CN=localhost"

openssl x509 -req -passin pass:phrase -days 365 -in server.csr -CA ca.crt -CAkey ca.key -set_serial 01 -out server.crt

openssl rsa -passin pass:phrase -in server.key -out server.key

openssl genrsa -passout pass:phrase -des3 -out client.key 4096

openssl req -passin pass:phrase -new -key client.key -out client.csr -subj  "/C=CN/ST=Shanghai/L=Shanghai/O=Test/OU=Client/CN=localhost"

openssl x509 -passin pass:phrase -req -days 365 -in client.csr -CA ca.crt -CAkey ca.key -set_serial 01 -out client.crt

openssl rsa -passin pass:phrase -in client.key -out client.key