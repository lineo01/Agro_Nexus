import tensorflow as tf
import numpy as np
from tensorflow.keras.preprocessing import image

x=input("Enter the name of file with extention ")

model = tf.keras.models.load_model("model.h5")

IMG_SIZE = (224, 224)

class_names = [
    "Anthracnose",
    "algal leaf",
    "bird eye spot",
    "brown blight",
    "gray light",
    "healthy",
    "red leaf spot",
    "white spot"
]

def predict(img_path):
    img = image.load_img(img_path, target_size=IMG_SIZE)
    img = image.img_to_array(img)
    img = np.expand_dims(img, axis=0) / 255.0

    preds = model.predict(img)[0]
    idx = np.argmax(preds)

    print("\nRESULT:")
    print("Disease:", class_names[idx])
    print("Confidence:", round(float(preds[idx]) * 100, 2), "%")

predict(rf"F:\Machine Learning\teahackathon\tea-disease-mvp\{x}")

