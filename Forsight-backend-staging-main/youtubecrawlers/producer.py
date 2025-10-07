import json
from confluent_kafka import Producer
from django.conf import settings

def delivery_report(err, msg):
        if err is not None:
            print(f"Delivery failed: {err}")
        else:
            print(f"Message delivered to {msg.topic()} [{msg.partition()}]")


def produceEvent(topic,data=None):
    bootstrapServer= {
                        'bootstrap.servers': settings.KAFKA_SERVER,  # Kafka server address
                    }

    producer = Producer(bootstrapServer)
    message_value = json.dumps(data)
    producer.produce(topic, key='key', value=message_value, callback=delivery_report)
    producer.flush()


def createNewYoutbeProfileBasedTarget(metaData):
    # Example data
    topic = settings.YOUTUBE_NEW_PROFILE_TOPIC
    produceEvent(topic,metaData)

def createNewYoutubeKeywordBasedTarget(metaData):
    topic = settings.YOUTUBE_NEW_KEYWORD_TOPIC
    produceEvent(topic,metaData)


def reCrawlYoutubeProfilesDataEvent(metaData):
    topic = settings.YOUTUBE_NEW_PROFILE_TOPIC
    produceEvent(topic,metaData)

def reCrawlYoutubeKeywordsDataEvent(metaData):
    topic = settings.YOUTUBE_NEW_KEYWORD_TOPIC
    produceEvent(topic,metaData)

