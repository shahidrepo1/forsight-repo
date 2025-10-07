import json
from confluent_kafka import Producer
from django.conf import settings

def delivery_report(err, msg):
        if err is not None:
            print(f"Delivery failed: {err}")
        else:
            print(f"Message delivered to {msg.topic()} [{msg.partition()}]")


def createNewXProfileBasedTarget(metaData):
    # Example data
    topic = settings.TWITTER_NEW_PROFILE_TOPIC
    produceEvent(topic,metaData)


def produceEvent(topic,data=None):
    print("----------------------- ReCrawling X Profiles Data --12121212121212121212121-----------------")

    bootstrapServer= {
                        'bootstrap.servers': settings.KAFKA_SERVER,  # Kafka server address
                    }

    producer = Producer(bootstrapServer)
    message_value = json.dumps(data)
    producer.produce(topic, key='key', value=message_value, callback=delivery_report)
    producer.flush()
    print("----------------------- ReCrawling X Profiles Data --131313131131313131313131-----------------")



def createNewKeywordBasedTarget(metaData):
    # Example data
   topic = settings.TWITTER_NEW_KEYWORD_TOPIC
   produceEvent(topic,metaData)


def reCrawlXProfilesDataEvent(data):
    # Example data
    print("----------------------- ReCrawling X Profiles Data --111111111111111111-----------------")

    topic = settings.RECRAWL_TWITTER_NEW_PROFILE_TOPIC
    produceEvent(topic,data)

def reCrawlXKeywordDataEvent(data):
    # Example data
    topic = settings.RECRAWL_TWITTER_NEW_KEYWORD_TOPIC
    produceEvent(topic,data)
