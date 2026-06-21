from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "../model.h5")
model = tf.keras.models.load_model(MODEL_PATH)

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

disease_info = {
    "Anthracnose": "Remove infected leaves. Use neem spray.",
    "algal leaf": "Improve airflow and reduce humidity.",
    "bird eye spot": "Prune infected parts.",
    "brown blight": "Fungal disease. Remove affected leaves.",
    "gray light": "Improve soil nutrition.",
    "healthy": "Plant is healthy.",
    "red leaf spot": "Remove infected leaves quickly.",
    "white spot": "Control moisture levels."
}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    image_bytes = await file.read()
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize(IMG_SIZE)

    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    preds = model.predict(img_array)[0]
    idx = int(np.argmax(preds))

    return {
        "disease": class_names[idx],
        "confidence": float(preds[idx]),
        "info": disease_info.get(class_names[idx])
    }