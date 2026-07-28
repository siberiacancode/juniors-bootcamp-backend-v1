pipeline {
    agent any
    environment {
        GITHUB_TOKEN=credentials('github-container')
        DATABASE_URL=credentials('database-url')
        IP=credentials('yandex-apps-ip')

        IMAGE_NAME='siberiacancode/juniors-bootcamp-backend-v1'
        IMAGE_VERSION='latest'
        PORT='3101'
        
        JWT_SECRET=credentials('jwt-secret')

        NETWORK_NAME='juniors-bootcamp'
    }
    stages {
        stage('cleanup') {
            steps {
                sh 'docker system prune -a --volumes --force'
            }
        }
        stage('build image') {
            steps {
                sh 'docker build -t $IMAGE_NAME:$IMAGE_VERSION .'
            }
        }
        stage('login to GHCR') {
            steps {
                sh 'echo $GITHUB_TOKEN_PSW | docker login ghcr.io -u $GITHUB_TOKEN_USR --password-stdin'
            }
        }
        stage('tag image') {
            steps {
                sh 'docker tag $IMAGE_NAME:$IMAGE_VERSION ghcr.io/$IMAGE_NAME:$IMAGE_VERSION'
            }
        }
        stage('push image') {
            steps {
                sh 'docker push ghcr.io/$IMAGE_NAME:$IMAGE_VERSION'
            }
        }
        stage('deploy') {
            steps {
                withCredentials(bindings: [sshUserPrivateKey(credentialsId: 'yandex-apps-container', keyFileVariable: 'SSH_PRIVATE_KEY', usernameVariable: 'SSH_USERNAME')]) {
                    sh 'install -m 600 -D /dev/null ~/.ssh/id_rsa'
                    sh 'rm ~/.ssh/id_rsa'
                    sh 'cp -i $SSH_PRIVATE_KEY ~/.ssh/id_rsa'

                    sh 'ssh -o "StrictHostKeyChecking=no" $SSH_USERNAME@$IP \
                        "sudo docker network create $NETWORK_NAME || true"'
                        
                    sh 'ssh -o "StrictHostKeyChecking=no" $SSH_USERNAME@$IP \
                        "sudo docker login ghcr.io -u $GITHUB_TOKEN_USR --password $GITHUB_TOKEN_PSW &&\
                        sudo docker rm -f juniors-bootcamp-backend-v1 || true &&\
                        sudo docker pull ghcr.io/siberiacancode/juniors-bootcamp-backend-v1 &&\
                        sudo docker run --restart=always --name juniors-bootcamp-backend-v1 -d -p $PORT:$PORT -e PORT=$PORT -e SERVER_URL=$SERVER_URL -e DATABASE_URL=$DATABASE_URL -e SQL_DATABASE_URL=$SQL_DATABASE_URL -e JWT_SECRET=$JWT_SECRET --network juniors-bootcamp ghcr.io/siberiacancode/juniors-bootcamp-backend-v1"'
                }
            }
        }
    }
    post {
        always {
            sh 'docker logout'
        }
    }
}