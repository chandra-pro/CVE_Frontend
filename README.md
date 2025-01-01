
- **To Install Docker Engine on Ubuntu**

```bash
sudo apt-get install docker-ce docker-ce-cli containerd.io
```
- Verify that Docker Engine is installed correctly by running the `hello-world` image.

```bash
sudo docker run hello-world
```

- **Post-installation steps for Linux**
- To create the docker group and add your user:

1. Create the docker group.

```bash
sudo groupadd docker
```

2. Add your user to the docker group.

```bash
sudo usermod -aG docker $USER
```

3. To activate the changes to groups.

```bash
newgrp docker 
```

4. Verify that you can run docker commands without sudo.

```bash
docker run hello-world
```

`Note`: If user is not added to the docker group then `sudo` access is required to run the project .

# CVE-HMI

Follow following steps to setup the system.

- Clone the repository.

```bash
git clone ssh://git@stash.alm.mentorg.com:7999/cvec/cve-hmi-4.0.git --branch CVE-4.0
```


- Change to the cloned directory.

```bash
cd cve-hmi-4.0
```

> - Add API BASE_URL in .env file

- URL on which Backend is deployed
- Example: http://137.202.213.83:8856/

- Build docker image.

```bash
docker build -t 'cve-hmi-4.0' .
```
> - It will take approximately `10 minutes` to build the docker image

- Note : Go to directory where cve-checker-tool-4.0 folder is there 




> - `image_id` can be listed by using `docker images` command.
> - sample of `image-id` - `12e076ef2348`
> - You can choose any `one port` to map.


- Run the container

```bash
docker run -p {port_no}:{port_no} -e PORT={port_no} cve-hmi-4.0

```

- Example

```bash
docker run -p 5000:5000 -e PORT=5000 cve-hmi-4.0
````

- Some useful docker commands.

```bash
docker start <container_name> #To start the container.
docker stop <container_name> #To stop the running container.
docker attach <container_name> #To attach the started container.
```



- In order to run the frontend on browser:



```bash

http://localhost:{port_number}/
```
- To get container id use `docker ps -a` 

-To get url of frontend

```bash

ifconfig
http://{ipv4}:{port_number}/
```