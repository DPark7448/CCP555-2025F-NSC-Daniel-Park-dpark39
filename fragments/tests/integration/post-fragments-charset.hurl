# Content-Type with charset works & is preserved (normalized to text/plain)
POST http://localhost:8080/v1/fragments
Content-Type: text/plain; charset=utf-8
[BasicAuth]
user1@email.com:password1

`Charset test`

HTTP/1.1 201

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "text/plain"
jsonpath "$.fragment.size" == 12

[Captures]
url: header "Location"

# GET metadata & data back as JSON
GET {{url}}
Accept: application/json
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

[Asserts]
jsonpath "$.fragment.type" == "text/plain"
jsonpath "$.fragment.size" == 12
jsonpath "$.data" == "Charset test"
