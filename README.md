OSLO
----

### Workflow
`index.html` is a page about an organisation/service/location.  
The metadata in the document can be managed on `/admin/`.

The editor looks for a JSON-LD scripttag and passes the content to the frontend.  
On page load, the existing JSON-LD graph is transformed to the internal model: 1 organisation containing a service and some locations. Schema.org is expected as default context.  
After making a change, ISA core triples are added to the model and then outputted as JSON-LD.

Saving will send a PUT request to replace the old metadata by the latest JSON-LD. If there was no metadata before, it will be inserted before `</body>` or `</head>`.

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
