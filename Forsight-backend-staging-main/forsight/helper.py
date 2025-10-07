import re
import spacy
from collections import Counter
from itertools import chain

from django.core.paginator import Paginator


nlp = spacy.load("en_core_web_sm")


def paginate_queryset(queryset, request, page_size=15):
    """
    Paginate a given queryset based on the request parameters.

    Args:
        queryset (QuerySet): The queryset to be paginated.
        request (HttpRequest): The HTTP request object containing query parameters.
        page_size (int, optional): The number of items per page. Defaults to 15.

    Returns:
        tuple: A tuple containing:
            - page_obj (Page): The Page object for the current page.
            - pagination_data (dict): A dictionary containing pagination details:
                - count (int): The total number of items in the queryset.
                - next (int or None): The page number of the next page, or None if there is no next page.
                - previous (int or None): The page number of the previous page, or None if there is no previous page.
                - page_size (int): The number of items per page.
                - current_page (int): The current page number.
                - total_pages (int): The total number of pages.

    Raises:
        ValueError: If the page number in the request is invalid.
    """
    paginator = Paginator(queryset, page_size)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    pagination_data = {
        'count': paginator.count,
        'next': page_obj.next_page_number() if page_obj.has_next() else None,
        'previous': page_obj.previous_page_number() if page_obj.has_previous() else None,
        'page_size': paginator.per_page,
        'current_page': page_obj.number,
        'total_pages': paginator.num_pages,
    }
    
    return page_obj, pagination_data


# def cleanText(text):
#     text = re.sub(r'http\S+', '', text)
#     text = re.sub(r'[^A-Za-z\s]', '', text)
#     return text


# def generateWordCloudData(data):
#     # Step 1: Tokenization with optimized batch processing
#     batch_size = 500  # Process text in smaller chunks
#     cleaned_text = []

#     for i in range(0, len(data), batch_size):
#         batch = " ".join(filter(None, data[i:i+batch_size]))
#         cleaned_text.append(cleanText(batch))  # Assume `cleanText` is an optimized function

#     # **NEW: Join and truncate text to max 999,999 characters**
#     full_text = " ".join(cleaned_text)[:999999]  # Ensure we stay within spaCy's limit

#     # Process using spaCy (now within character limit)
#     doc = nlp(full_text)  

#     # Token count
#     token_count = len(doc)
#     print(f"Total Tokens in Combined Text: {token_count}")

#     # Step 2: Extract nouns & adjectives efficiently
#     filteredWords = [token.text for token in doc if token.pos_ in ("NOUN", "ADJ")]

#     if not filteredWords:
#         return []

#     # Step 3: Count word frequencies
#     wordFrequency = Counter(filteredWords)
#     totalWords = sum(wordFrequency.values())

#     # Step 4: Get top words & normalize scores
#     topWords = wordFrequency.most_common(20)
#     maxFreq = topWords[0][1] if topWords else 1  # Avoid division by zero

#     return [
#         {
#             "word": word,
#             "score": round((freq / maxFreq) * 100, 2),
#             "count": freq,
#             "percentile": round((freq / totalWords) * 100, 2)
#         }
#         for word, freq in topWords
#     ]



import re
import unicodedata
from collections import Counter

def cleanText(text):
    text = re.sub(r'http\S+', '', text)
    text = re.sub(r'[^\u0600-\u06FFa-zA-Z\s]', '', text)
    return text

urdu_stopwords = {
    "کی", "کا", "کو", "ہے", "سے", "میں", "بھی", "پر", "کہ", "یہ", "ایک", "اس", "اور", "ہیں", "نہیں",
    "تو", "تم", "وہ", "ہم", "آپ", "ان", "تھا", "تھی", "تھے", "کر", "کیا", "کیے", "رہا", "رہے", "رہی",
    "نے", "والا", "والی", "والے", "لیے", "پھر", "جب", "اگر", "کرتا", "کرتے", "کرتی", "کریں", "کریا", "کرے",
    "کوئی", "کچھ", "سب", "ہر", "جن", "جنہوں", "جنہیں", "جن کا", "جن کی", "جن کے", "جن کو", "جن پر", "جن میں",
    "جن سے", "جہاں", "جس", "جسے", "جس کا", "جس کی", "جس کے", "جس پر", "جس میں", "جس سے", "کب", "کس", "کیا",
    "کیوں", "کتنے", "کون", "کیسی", "کسا", "کسی", "کسی کو", "کسے", "کسی نے", "کس کا", "کس کی", "کس کے","،",
    "دیکھ", "زیادہ", "ہوں", "Rs", "pc", "و", "کسی کو", "کسے", "کسی نے", "کس کا", "کس کی", "کس کے","،",
    "کس کو", "کس پر", "کس میں", "کس سے", "مواد", "کرنے", "رہی", "کے", "؟", "۔", "!", ":", ";", ",", "(", ")", "Jun", "]", "{", "}", "'", '"', "…", "‘", "’", "“", "”"
}

# Normalize stopwords once
normalized_urdu_stopwords = {
    unicodedata.normalize('NFC', word.strip()) for word in urdu_stopwords
}

def generateWordCloudData(data):
    batch_size = 500
    cleaned_text = []

    for i in range(0, len(data), batch_size):
        batch = " ".join(filter(None, data[i:i+batch_size]))
        cleaned_text.append(cleanText(batch))

    full_text = " ".join(cleaned_text)[:99999]

    doc = nlp(full_text)

    token_count = len(doc)
    print(f"Total Tokens in Combined Text:eeeeeeeeee {token_count}")

    # Step 2: Extract nouns & adjectives, remove stopwords (normalized)
    filteredWords = []
    for token in doc:
        if token.pos_ in ("NOUN", "ADJ"):
            normalized = unicodedata.normalize('NFC', token.text.strip())
            if normalized not in normalized_urdu_stopwords:
                filteredWords.append(token.text)

    if not filteredWords:
        return []

    # Step 3: Count word frequencies
    wordFrequency = Counter(filteredWords)
    totalWords = sum(wordFrequency.values())

    # Step 4: Get top words & normalize scores
    topWords = wordFrequency.most_common(30)
    maxFreq = topWords[0][1] if topWords else 1

    return [
        {
            "word": word,
            "score": round((freq / maxFreq) * 100, 2),
            "count": freq,
            "percentile": round((freq / totalWords) * 100, 2)
        }
        for word, freq in topWords
    ]
