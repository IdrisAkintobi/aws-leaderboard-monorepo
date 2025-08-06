Local Testing with SAM and LocalStack
This document outlines how to test the modularized full-stack application locally using the AWS SAM CLI and LocalStack. This approach simulates the AWS environment on your local machine, allowing you to test without incurring any costs.

Prerequisites
Docker: LocalStack runs in a Docker container, so you must have Docker installed and running.

AWS CLI: The AWS CLI is needed to configure a local profile.

AWS SAM CLI: This is used to build and deploy the application.

LocalStack: You can install it via pip: pip install localstack awscli-local.

Setup Steps
Configure a LocalStack Profile:
This tells the AWS CLI to route requests to your local LocalStack instance instead of the real AWS cloud.

aws configure set aws_access_key_id test --profile=localstack
aws configure set aws_secret_access_key test --profile=localstack
aws configure set region eu-north-1 --profile=localstack
aws configure set output json --profile=localstack

Start LocalStack:
From your terminal, start the LocalStack container.

localstack start

Build the Project:
First, ensure you have run npm install and npm run build from the project root to compile your TypeScript code. Then, use the SAM CLI to build the project.

sam build

Deploy to LocalStack:
Deploying with --guided is the easiest way to start. It will prompt you for a stack name and other configurations.

sam deploy --guided --template-file localstack-template.yaml --profile=localstack

This command will use the localstack-template.yaml file you created and deploy the resources to your local LocalStack instance.

Get Local API Endpoints:
After deployment, the SAM CLI will show the output values (e.g., RestApiUrl, WebSocketApiUrl). These will be the local endpoints for your application. You can also get them from the sam list endpoints command.

sam list endpoints --stack-name your-stack-name

Run the Frontend:
You can serve the public/index.html file using a simple HTTP server (e.g., a VS Code extension, Python's http.server, or Node's http-server). Update the API_BASE_URL in your frontend code to use the local endpoint from the previous step.

Test the Application:
Open the frontend in your browser and start interacting with the application. The requests will now be routed to your local Lambda function and other LocalStack services.
