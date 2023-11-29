import csv
import math
import openai

# Set your OpenAI API key
openai.api_key = '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'

def chat_with_gpt(prompt):
    # Send the prompt to ChatGPT
    response = openai.Completion.create(
        engine="text-davinci-002",  # You can use "text-davinci-002" for a less powerful but cheaper model
        prompt=prompt,
        max_tokens=450  # You can adjust the number of tokens based on your needs
    )

    # Display the ChatGPT response
    return (response['choices'][0]['text'])


# Get the cosine-similarity of two vectors
def cosine_similarity(vec1, vec2):
    # First get dot product
    dot_prod = 0
    for i in range(len(vec1)):
        dot_prod += float(vec1[i]) * float(vec2[i])
    # Now get magnitudes
    vec1_mag = 0
    vec2_mag = 0
    for i in range(len(vec1)):
        vec1_mag += vec1[i] ** 2
        vec2_mag += vec2[i] ** 2
    vec1_mag = math.sqrt(vec1_mag)
    vec2_mag = math.sqrt(vec2_mag)
    # Now divide dot product by the product of the magnitudes
    return dot_prod / (vec1_mag * vec2_mag)



# Clean up the GPT response and put it into a list
def trim_response(resp):
    response_list = resp.split(',')
    for i in range(len(response_list)):
        response_list[i] = float(response_list[i].strip())  # Strip away whitespace, convert to float

    return response_list  # This is a list of 4 values: color intensity, sleeve length, neckline boldness, material texture.






def getInfo():
    # Get user query from the command line
    # user_input = input("Search our shirt store: ")
    user_input = "blue shirt"
    # Add some explanation for AI on how to handle the query
    padding = 'We have a query from a user searching for a shirt. Based on the query assign 4 values from 1 to 5. The first value respresents color intensity of the shirt, with (1=low intensity, 5=high). The second value is sleeve length (1=short, 5=long). The third value is neckline boldness (1=standard crew-neck, 5=unique/bold necklines like over-the-shoulder). The fourth value is material texture (1=smooth, 5=textured). Return the values separated by commas, with no spaces. Do not return any text at all. Only return the comma separated values. Here is the query:'
    user_input = padding + user_input
	# Send the query to GPT and get back a vector with the latent factors
    query_vector = trim_response(chat_with_gpt(user_input))


    # Read CSV file containing our shirt inventory into 'shirts_list'
    file_path = 'shirts.csv'
    with open(file_path, 'r') as csvfile:
        csv_reader = csv.reader(csvfile)
        shirts_list = list(csv_reader)
    shirts_list.pop(0)  # Remove the first row, which is just the headers


    # Create dictionary with each of our shirts, and their cosine similarity to the query
    shirt_similarities = {}
    for i in range(len(shirts_list)):
        # First lets get the four values for shirts_list[i] into a new list
        shirt_values = [0,0,0,0]
        shirt_values[0] = float(shirts_list[i][1])
        shirt_values[1] = float(shirts_list[i][2])
        shirt_values[2] = float(shirts_list[i][3])
        shirt_values[3] = float(shirts_list[i][4])
        # Now 'shirt_values' is formatted properly for our cosine-similarity function
        query_shirt_similarity = cosine_similarity(query_vector, shirt_values)
        # Now append this similarity value to our dictionary
        shirt_similarities[shirts_list[i][0]] = query_shirt_similarity
	

    # Now sort the dictionary by similarity.
    sorted_similarities = {k: v for k, v in sorted(shirt_similarities.items(), key=lambda item: item[1], reverse=True)}


    # Print the top-3 most similar results
    count = 0
    for i in sorted_similarities:
        print(i, '\n', sorted_similarities[i])
        count += 1
        if count == 3:
            break