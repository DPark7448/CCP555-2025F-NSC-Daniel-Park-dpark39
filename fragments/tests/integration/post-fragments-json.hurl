POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
user1@email.com:password1

`{"message":"Hello from JSON"}`

HTTP/1.1 201

[Captures]
json_fragment_url: header "Location"
json_fragment_id: jsonpath "$.fragment.id"

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.ownerId" == "11d4c22e42c8f61feaba154683dea407b101cfd90987dda9e342843263ca420a"
jsonpath "$.fragment.type" == "application/json"
jsonpath "$.fragment.size" == 29

# Read the stored JSON fragment
GET {{json_fragment_url}}
Accept: application/json
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

[Asserts]
jsonpath "$.fragment.id" == "{{json_fragment_id}}"
jsonpath "$.fragment.ownerId" == "11d4c22e42c8f61feaba154683dea407b101cfd90987dda9e342843263ca420a"
jsonpath "$.fragment.type" == "application/json"
jsonpath "$.fragment.size" == 29
jsonpath "$.data" == "{\"message\":\"Hello from JSON\"}"
