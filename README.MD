# HOW TO RUN

## MySql, PHPAdmin

- Install Docker Desktop and Docker compose

```
docker compose -f ./deployment.yaml up -d mysql8-container
docker compose -f ./deployment.yaml up -d phpmyadmin8-container
```

- Go to localhost:8100 and import database

## BACKEND

- Install packed and run (Require maven and JavaHome=17)

```
mvn clean install
mvn spring-boot:run
```

## FRONTEND

- Install packed (Require Node Js)

```
npm install
npm audit fix
npm start
```

## POSTMAN

- Import JSON into Postman

# DEPLOY

## Setup EC2 Instance

- Create Instane t2.large with 20gb volume
- Set key pair to acces ssh and Security group
- Set Elastic ip and use AWS route 53 to config DNS
- Install dependency like jenkins, git, maven, docker, docker-compose and get access for user

## Container

- Write dockerfile for application and use docker-compose to manage container
- Build test and push into DockerHub for Deployment with Kubernetes

## Setup CICD

- Start SonarQube container in port 9000
- Config Jenkins and install tools necessary
- Create credential in sonar and jenkin, Webhook for Sonar and GitHub
- Write the CICD pipeline with multistages  

## SSl certificates

- Create free key with ZeroSSL or Let's Encrypt
- Save and push into container and config to website
