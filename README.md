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

### Run the project
    docker run -it --rm --name oslo -p 80:80 thgh/oslo
    
You can now browse to [localhost](http://localhost) to view the page.

When running in windows, you may need to do `docker-machine ip` to find the IP of the server (rather than `localhost`).

### Development
    docker run -it --rm --name oslo -p 81:80 -v /Users/thomas/projects/oslo:/var/www/html thgh/oslo

### After development
    docker build -t thgh/oslo .
    docker push thgh/oslo
