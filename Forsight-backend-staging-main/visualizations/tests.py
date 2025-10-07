#!/usr/bin/env python3
from wordcloud import WordCloud

text = """THis is an example text for generating a word cloud.
It contains several words that will be used to create a visual representation of word frequency.
The word cloud will highlight the most frequent words in the text.
Word clouds are a popular way to visualize text data.
This example is specifically designed to demonstrate how to generate a word cloud using Python.
The word cloud will be saved as an image file.  """

# Generate
wc = WordCloud(
    width=800,
    height=400,
    background_color="white",
    max_words=100
).generate(text)

# Save to file as before
wc.to_file("hydropower_wordcloud.png")

# Print the word→frequency dict instead of showing the plot
for word, freq in wc.words_.items():
    print(f"{word}: {freq:.4f}")
