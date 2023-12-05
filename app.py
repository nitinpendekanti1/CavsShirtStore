import numpy as np
import os
# turn off oneDNN operations, which can cause roundoff error 
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'  
from PIL import Image
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense
from tensorflow.keras.preprocessing.image import img_to_array
from tensorflow.keras.applications.vgg16 import preprocess_input

# print("TensorFlow version:", tf.__version__)

### FUNCTIONS
# resize the images, output to /shirts
def resize_images(in_folder, out_folder, target_size=(224, 224)):
    os.makedirs(out_folder, exist_ok=True)
    for filename in os.listdir(in_folder):
        if (filename.endswith('.PNG')) or (filename.endswith('.png')):
            img = Image.open(os.path.join(in_folder, filename)).resize(target_size)
            img.save(os.path.join(out_folder, filename))

# load and preprocess an image using tensorflow.keras functions
def load_and_preprocess_image(image_path):
    img = Image.open(image_path)

    # Check if the image has an alpha channel (transparency)
    if img.mode == 'RGBA':
        # Convert the image to RGB and add a white background
        img = img.convert('RGB')
        img_with_white_background = Image.new('RGB', img.size, (255, 255, 255))
        img_with_white_background.paste(img, mask=img.split()[3] if len(img.split()) > 3 else None)
        img = img_with_white_background
    else:
        # If the image doesn't have transparency, simply convert it to RGB
        img = img.convert('RGB')

    # Convert the image to a NumPy array and preprocess for the model
    img_array = img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)

    return img_array

# create tensorflow CNN model
def create_cnn_model(embedding_size):
    model = Sequential()
    model.add(Conv2D(32, (3, 3), activation='relu', input_shape=(224, 224, 3)))
    model.add(MaxPooling2D((2, 2)))
    model.add(Conv2D(64, (3, 3), activation='relu'))
    model.add(MaxPooling2D((2, 2)))
    model.add(Conv2D(128, (3, 3), activation='relu'))
    model.add(MaxPooling2D((2, 2)))
    model.add(Flatten())
    model.add(Dense(embedding_size, activation='linear'))
    return model

# create embeddings for a shirt
def predict_embeddings(image_file, model):
    img_array = load_and_preprocess_image(image_file)
    shirt_name = os.path.splitext(os.path.basename(image_file))[0]

    embedding = model.predict(img_array).flatten()
    
    shirt_info = {
        'name': shirt_name,
        'embeddings': embedding.tolist(),
        'image': image_file, 
    }

    return shirt_info

# use model to predict embeddings and
# create shirts dict with name, embedding, path of each shirt
def get_shirt_embeddings(images_folder):
    all_shirts = []
    for filename in os.listdir(images_folder):
        if (filename.endswith('.PNG')) or (filename.endswith('.png')):
            image_path = os.path.join(images_folder, filename)
            shirt_info = predict_embeddings(image_path, model)
            all_shirts.append(shirt_info)
    return all_shirts


# compute cosine similarity using NumPy
def cosine_similarity(embedding1, embedding2):
    dot = np.dot(embedding1, embedding2)
    n1 = np.linalg.norm(embedding1)
    n2 = np.linalg.norm(embedding2)
    similarity = dot / (n1 * n2)
    return similarity

def find_top_3(embedding, all_embeddings):
    similarities = []
    for i, other_embedding in enumerate(all_embeddings):
        if not np.array_equal(embedding, other_embedding):
            similarity = cosine_similarity(embedding, other_embedding)
            similarities.append((i, similarity))

    similarities.sort(key=lambda x: x[1], reverse=True)
    top_3 = similarities[:3]
    return top_3


# find the top 3 most similar shirt for 5 random shirts.
def cosine_scoring_test(all_shirts):
    results = []
    for _ in range(5):
        random_shirt = np.random.choice(all_shirts)
        shirt_name = random_shirt['name']
        shirt_image = random_shirt['image']
        shirt_embedding = random_shirt['embeddings']

        # find the top 3 most similar shirts
        top_3_similarities = find_top_3(shirt_embedding, [shirt['embeddings'] for shirt in all_shirts])

        # extract shirt information for the top 3
        top_3_info = [
            {
                'name': all_shirts[i]['name'],
                'image': all_shirts[i]['image'],
                'embeddings': np.round(all_shirts[i]['embeddings'],3),
                'similarity': np.round(similarity, 4)
            } for i, similarity in top_3_similarities
        ]

        results.append({
            'shirt_name': shirt_name,
            'shirt_image': shirt_image,
            'top_3_similarities': top_3_info,
        })
    return results

### TESTING
# resize all images to 244x244
resize_images('static/raw_shirts', 'static/shirts')

# get the images locally
images_folder = 'static/shirts'

# create the cnn
embedding_size = 16
model = create_cnn_model(embedding_size)

# compile the model using tf.keras API
model.compile(optimizer=tf.optimizers.Adam(), loss='mse')

# get name, embedding, image path of each shirt
all_shirts = get_shirt_embeddings(images_folder)

# use flask to render the htmls
import json
from flask import Flask, render_template, request, jsonify, redirect, url_for
app = Flask(__name__)

selectedEmbeddings = []

# Home page
@app.route('/')
def index():
    return render_template('index.html')

# Redirect from the index to cnn.html
@app.route('/cnn')
def go_to_cnn():
    return render_template('cnn.html')

# Button 1: Page to test embeddings
@app.route('/test_embeddings')
def show_results():
    results = cosine_scoring_test(all_shirts)
    return render_template('test_embeddings.html', results=results)

# Prompt user to choose 3 shirts they like, then send that data to centroid.html
@app.route('/recommend', methods=['GET', 'POST'])
def get_recommendations():
    global selected_shirts

    if request.method == 'POST':
        selected_shirts_data = request.json.get('selectedShirts', [])
        selected_shirts = selected_shirts_data  # Use the data directly

        # Additional processing with selected_shirts if needed

        return jsonify({'status': 'success'})

    return render_template('recommend.html', prompt_shirts=all_shirts)

# find centroid, Display the recommendations, go back home button
@app.route('/centroid', methods=['POST', 'GET'])
def calculate_recommendations():
    global selected_shirts

    # Get the embeddings of the selected shirts
    selected_embeddings = [shirt['embeddings'] for shirt in selected_shirts]

    # find centroid and the top 3 most similar shirts to the centroid
    centroid = np.mean(selected_embeddings, axis=0)
    
    # Find shirts that were not selected on the recommend.html page
    remaining_shirts = [shirt for shirt in all_shirts if shirt['name'] not in [selected['name'] for selected in selected_shirts]]
    
    top_3_similarities = find_top_3(centroid, [shirt['embeddings'] for shirt in remaining_shirts])

    # extract shirt information for the top 3
    top_3_info = [
        {
            'name': all_shirts[i]['name'],
            'image': all_shirts[i]['image'],
            'embeddings': np.round(all_shirts[i]['embeddings'],3).tolist(), 
            'similarity': np.round(similarity, 4)
        } for i, similarity in top_3_similarities
    ]

    # Render centroid.html with the centroid embedding and top 3 similarities
    return render_template('centroid.html', centroid=centroid, top_3_info=top_3_info)

# Enable Flask debugger
if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)
