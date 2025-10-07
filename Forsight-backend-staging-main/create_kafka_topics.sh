#!/bin/bash

# Kafka bin directory
KAFKA_BIN="/opt/kafka/bin"

# Kafka server IP address
<<<<<<< HEAD
KAFKA_SERVER="192.168.11.60"
=======
KAFKA_SERVER="192.168.11.60"
>>>>>>> 2707200be7038010609aee935de3c8de56971ffa

# List of topics to be created
topics=(
  "twitter_profile_base_topic"
  "twitter_keyword_base_topic"
  "recrawl_twitter_profile_base_topic"
  "recrawl_twitter_keyword_base_topic"
  "youtube_keyword_base_topic"
  "youtube_profile_base_topic"
  "web_keyword_base_topic"
  "web_profile_base_topic"
)

# Loop through each topic and create it
for topic in "${topics[@]}"
do
    /bin/bash $KAFKA_BIN/kafka-topics.sh --create --topic "$topic" --partitions 1 --replication-factor 1 --bootstrap-server $KAFKA_SERVER:9092
    echo "Created topic: $topic"
done
