import os
import shutil
import random

RAW_DIR = "tea sickness dataset"
OUTPUT_DIR = "dataset"
TRAIN_RATIO = 0.8

# reset output folder safely
if os.path.exists(OUTPUT_DIR):
    shutil.rmtree(OUTPUT_DIR)

print("Rebuilding dataset from scratch...")

classes = os.listdir(RAW_DIR)

for cls in classes:
    class_path = os.path.join(RAW_DIR, cls)

    if not os.path.isdir(class_path):
        continue

    images = [
        f for f in os.listdir(class_path)
        if f.lower().endswith((".jpg", ".jpeg", ".png"))
    ]

    if len(images) == 0:
        continue

    random.shuffle(images)

    split_idx = int(len(images) * TRAIN_RATIO)

    train_imgs = images[:split_idx]
    val_imgs = images[split_idx:]

    train_out = os.path.join(OUTPUT_DIR, "train", cls)
    val_out = os.path.join(OUTPUT_DIR, "val", cls)

    os.makedirs(train_out, exist_ok=True)
    os.makedirs(val_out, exist_ok=True)

    for img in train_imgs:
        shutil.copy2(
            os.path.join(class_path, img),
            os.path.join(train_out, img)
        )

    for img in val_imgs:
        shutil.copy2(
            os.path.join(class_path, img),
            os.path.join(val_out, img)
        )

    print(f"Processed: {cls} | train={len(train_imgs)} val={len(val_imgs)}")

print("\nDONE: Clean dataset created successfully.")