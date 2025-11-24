# 404 Test - unknown route
GET http://localhost:8080/this-route-does-not-exist

HTTP/1.1 404

[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 404
