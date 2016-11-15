OSLO
----

### Workflow
`index.html` is read by php and finds json-ld by regex.
The json-ld piece is inserted in js.
It walks the graph and retrieves the basic data (mostly Schema.org).
After making a change, an expanded version of the model containing ISA core triples is stringified.
Save will send a PUT request to save what's on the left.

### Get started
    docker pull thgh/oslo

### Run the project on port 81
    docker stop oslo1
    docker rm oslo1
    docker run -d --name oslo1 -p 81:80 thgh/oslo

### Development
    docker stop oslo1
    docker rm oslo1
    docker run -d --name oslo1 -p 81:80 -v /Users/thomas/projects/oslo:/var/www/html thgh/oslo

### After development
    docker build -t thgh/oslo .
    docker push thgh/oslo
