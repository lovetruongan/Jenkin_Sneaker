pipeline{
    agent any
    environment{
        SONAR_HOME = tool "Sonar"
    }
    stages{
        stage("Clone code from github"){
            steps{
                git url : "https://github.com/lovetruongan/Jenkin_Sneaker", branch: "master"
            }
        }
        stage("SonarQube Analyst"){
            steps{
                withSonarQubeEnv("Sonar"){
                    sh "$SONAR_HOME/bin/sonar-scanner -Dsonar.projectName=Sneaker -Dsonar.projectKey=Sneaker -Dsonar.language=java -Dsonar.sources=Sneakers_BE/src/main/java/ -Dsonar.java.binaries=. "
                }
            }
        }
        stage("Sonar Quality gate scan"){
            steps{
                timeout(time: 2, unit : "MINUTES"){
                    waitForQualityGate abortPipeline: false
                }
            }
        }
        stage("Deploy"){
            steps{
                sh "docker-compose -f ./deployment.yaml up -d"
            }
        }
        
    }
}