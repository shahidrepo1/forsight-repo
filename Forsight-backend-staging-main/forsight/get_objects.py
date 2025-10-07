import boto3

value = input("enter a value")
print(value)
# Create an S3 session
s3 = boto3.resource(
    's3',
    endpoint_url='http://192.168.11.60:9020',
    aws_access_key_id='AKIA947E0882E6C4440E',
    aws_secret_access_key='lNdWCjmQrNm6yb37yqkvG47/nqrh8E8GLTwnBCUE',
    verify=False  # If SSL verification should be skipped
)

# Try accessing the bucket
bucket = s3.Bucket('forsight-bucket')
print([obj.key for obj in bucket.objects.all()])  # List objects in the bucket
