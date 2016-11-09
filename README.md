OSLO
----

### Workflow
`index.html` is read by php and finds json-ld by regex.
The json-ld piece is inserted in js.
It walks the graph and retrieves the basic data (mostly Schema.org).
After making a change, an expanded version of the model containing ISA core triples is stringified.
Save will send a PUT request to save what's on the left.
