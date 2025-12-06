# 1. Create a JSON fragment
POST http://localhost:8080/v1/fragments
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
Content-Type: application/json

{"service":"DynamoDB"}

HTTP/1.1 201
[Captures]
fragment1_url: header "Location"
fragment1_id: jsonpath "$.fragment.id"

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.ownerId" == "11d4c22e42c8f61feaba154683dea407b101cfd90987dda9e342843263ca420a"
jsonpath "$.fragment.type" == "application/json"
jsonpath "$.fragment.size" == 22

# 2. Read fragment info
GET {{fragment1_url}}
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
Accept: application/json

HTTP/1.1 200
[Asserts]
jsonpath "$.fragment.id" == "{{fragment1_id}}"
jsonpath "$.fragment.ownerId" == "11d4c22e42c8f61feaba154683dea407b101cfd90987dda9e342843263ca420a"
jsonpath "$.fragment.type" == "application/json"
jsonpath "$.fragment.size" == 22
jsonpath "$.data" == "{\"service\":\"DynamoDB\"}"

# 3. Create a Markdown fragment
POST http://localhost:8080/v1/fragments
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
Content-Type: text/markdown
`DynamoDB is great.`

HTTP/1.1 201
[Captures]
fragment2_url: header "Location"
fragment2_id: jsonpath "$.fragment.id"

[Asserts]
jsonpath "$.fragment.ownerId" == "11d4c22e42c8f61feaba154683dea407b101cfd90987dda9e342843263ca420a"
jsonpath "$.fragment.type" == "text/markdown"
jsonpath "$.fragment.size" == 18

# 4. Read second fragment info
GET {{fragment2_url}}
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
Accept: application/json

HTTP/1.1 200
[Asserts]
jsonpath "$.fragment.id" == "{{fragment2_id}}"
jsonpath "$.fragment.type" == "text/markdown"
jsonpath "$.fragment.size" == 18
jsonpath "$.data" == "DynamoDB is great."

# 5. List all fragments (ids only)
GET http://localhost:8080/v1/fragments
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 200
[Asserts]
body contains "{{fragment1_id}}"
body contains "{{fragment2_id}}"

# 6. Delete the first fragment
DELETE {{fragment1_url}}
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 200

# 7. Confirm first fragment 404s
GET {{fragment1_url}}
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 404

# 8. List fragments again (first gone, second remains)
GET http://localhost:8080/v1/fragments
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 200
[Asserts]
body not contains "{{fragment1_id}}"
body contains "{{fragment2_id}}"
