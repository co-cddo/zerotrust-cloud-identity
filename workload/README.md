# Workload implementation:

The app should respond with the following json object:
`GET /`

```json
{
  "user": "unknown user",
  "history": ["insert identity history0 here", "insert identity history1 here"]
}
```

Where the user is the verified user that you've established from the request and the history is a complete history of all the JWT tokens that have been used to authenticate the user and workloads.

To chain multiple workloads, you can use the following path:
`GET /workload1/workload2/workload3`

Where workload1, workload2, and workload3 are the names of the workloads that you want to chain, they are all defined in the [Shared Hosts Config](../../shared_config/hosts.yaml)
You should pass the request on correctly to the next workload in the chain with the identity you know about
