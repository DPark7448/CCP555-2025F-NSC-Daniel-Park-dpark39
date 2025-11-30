# tests/integration/lab-9-s3.hurl

# 1. Create a text fragment
POST http://localhost:8080/v1/fragments
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
Content-Type: text/plain
`Hello S3!`

HTTP/1.1 201
[Captures]
url: header "Location"

# 2. Read the fragment
GET {{url}}
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 200
[Asserts]
header "content-type" contains "text/plain"
body == "Hello S3!"

# 3. Delete the fragment
DELETE {{url}}
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 200

# 4. Confirm it 404s now
GET {{url}}
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 404
