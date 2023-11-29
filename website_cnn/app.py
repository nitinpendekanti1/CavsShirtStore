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
        if filename.endswith('.PNG'):
            img = Image.open(os.path.join(in_folder, filename)).resize(target_size)
            img.save(os.path.join(out_folder, filename))

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

# load and preprocess an image using tensorflow.keras functions
def load_and_preprocess_image(image_path):
    img = Image.open(image_path)
    if img.mode == 'RGBA':
        img = img.convert('RGB')
    img_array = img_to_array(img) 
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)
    return img_array

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

# use model to predict embeddings and
# create shirts dict with name, embedding, path of each shirt
def get_shirt_embeddings(images_folder):
    all_shirts = []
    for filename in os.listdir(images_folder):
        if filename.endswith('.PNG'):
            image_path = os.path.join(images_folder, filename)
            shirt_info = predict_embeddings(image_path, model)
            all_shirts.append(shirt_info)
    return all_shirts


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
from flask import Flask, render_template, request
app = Flask(__name__)

selectedEmbeddings = []

# home page
@app.route('/')
def index():
    return render_template('index.html')

# Redirect from the index to cnn.html
@app.route('/cnn')
def go_to_cnn():
    return render_template('cnn.html')

# button 1: page to test embeddings
@app.route('/test_embeddings')
def show_results():
    results = cosine_scoring_test(all_shirts)
    return render_template('test_embeddings.html', results=results)

# button 2: page to prompt user for preferences and send to centroid.html
@app.route('/recommend')
def start_shopping():
    prompt_shirts = np.random.choice(all_shirts, 8, replace=False).tolist()
    return render_template('recommend.html', prompt_shirts=prompt_shirts)

# page to compute centroid and output recommendations
@app.route('/centroid', methods=['POST'])
def get_centroid():
    selected_embeddings = request.get_json().get('embeddings')
    selected_embeddings_list = json.loads(selected_embeddings)

    # Extract embeddings from the selected shirts
    selected_embeddings_list = [shirt['embeddings'] for shirt in selected_embeddings]

    # Calculate the centroid
    centroid = np.mean(selected_embeddings_list, axis=0)

    # Render the page with the centroid information
    return render_template('centroid.html', centroid=centroid)

# enable flask debugger
if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)
