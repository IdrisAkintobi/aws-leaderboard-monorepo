STACK_NAME=vue-app-stack
TEMPLATE_FILE=vue-app-s3.yaml
BUILD_DIR=dist

# Get bucket name from CloudFormation stack
BUCKET_NAME=$(shell aws cloudformation describe-stacks \
	--stack-name $(STACK_NAME) \
	--query "Stacks[0].Outputs[?OutputKey=='BucketName'].OutputValue" \
	--output text 2>/dev/null)

# Get website URL from CloudFormation stack
WEBSITE_URL=$(shell aws cloudformation describe-stacks \
	--stack-name $(STACK_NAME) \
	--query "Stacks[0].Outputs[?OutputKey=='WebsiteURL'].OutputValue" \
	--output text 2>/dev/null)

.PHONY: infra build-vue upload deploy upload-only delete-stack website-url

infra:
	@if aws cloudformation describe-stacks --stack-name $(STACK_NAME) >/dev/null 2>&1; then \
		echo "Stack exists, updating if needed..."; \
		aws cloudformation update-stack \
			--stack-name $(STACK_NAME) \
			--template-body file://$(TEMPLATE_FILE) \
			--capabilities CAPABILITY_NAMED_IAM || \
			echo "No changes to update."; \
		aws cloudformation wait stack-update-complete --stack-name $(STACK_NAME) || true; \
	else \
		echo "Creating stack..."; \
		aws cloudformation create-stack \
			--stack-name $(STACK_NAME) \
			--template-body file://$(TEMPLATE_FILE) \
			--capabilities CAPABILITY_NAMED_IAM; \
		aws cloudformation wait stack-create-complete --stack-name $(STACK_NAME); \
	fi

build-vue:
	npm install
	npm run build

upload:
	@if [ "$(BUCKET_NAME)" = "None" ] || [ -z "$(BUCKET_NAME)" ]; then \
		echo "Bucket name not found. Did you run 'make infra'?"; \
		exit 1; \
	fi
	aws s3 sync $(BUILD_DIR)/ s3://$(BUCKET_NAME) --delete

deploy: infra build-vue upload
	@echo "Deployment complete!"
	@echo "Website URL: $(WEBSITE_URL)"

upload-only: build-vue upload
	@echo "Uploaded latest Vue build to S3 bucket: $(BUCKET_NAME)"
	@echo "Website URL: $(WEBSITE_URL)"

delete-stack:
	aws cloudformation delete-stack --stack-name $(STACK_NAME)
	aws cloudformation wait stack-delete-complete --stack-name $(STACK_NAME)

website-url:
	@echo $(WEBSITE_URL)
