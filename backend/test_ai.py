import os
import torch
from sentence_transformers import SentenceTransformer
from PIL import Image

# Department Mapping based on main.py
DEPARTMENTS = [
    {"name": "EnHM", "trigger": "Dirty coach, Toilets, Trash, Garbage, Waste, Smell, Cleaning required"},
    {"name": "Electrical", "trigger": "Fan not working, Light, AC cooling, Charging Socket, Switch, Electrical issue"},
    {"name": "Mechanical", "trigger": "Broken seats, Windows, Berths, Door, Middle berth, Upper berth, Lever"},
    {"name": "Catering", "trigger": "Food quality, Pantry, Hygiene, Stale meal, Overcharging, Water bottle, Meal service"},
    {"name": "Security", "trigger": "Theft, Harassment, RPF help, Unauthorized person, Fighting, Safety, Luggage stolen"}
]

print("🚀 Initializing AI Categorization Test Engine...")
model = SentenceTransformer('clip-ViT-B-32')

dept_labels = [d["name"] for d in DEPARTMENTS]
dept_triggers = [d["trigger"] for d in DEPARTMENTS]
dept_embeddings = model.encode(dept_triggers, convert_to_tensor=True)

def run_test(case_name, text=None, image_path=None, expected_dept=None):
    print(f"\n--- TEST CASE: {case_name} ---")
    print(f"Input Text: {text}")
    print(f"Input Image: {image_path}")
    
    image_emb = None
    text_emb = None

    if image_path and os.path.exists(image_path):
        img = Image.open(image_path)
        image_emb = model.encode(img, convert_to_tensor=True)
    
    if text:
        text_emb = model.encode(text, convert_to_tensor=True)

    if image_emb is not None and text_emb is not None:
        final_emb = (image_emb + text_emb) / 2
    elif image_emb is not None:
        final_emb = image_emb
    else:
        final_emb = text_emb

    cos_scores = torch.nn.functional.cosine_similarity(final_emb.unsqueeze(0), dept_embeddings)
    best_idx = torch.argmax(cos_scores).item()
    predicted_dept = dept_labels[best_idx]
    confidence = cos_scores[best_idx].item()

    print(f"Result: {predicted_dept} (Confidence: {confidence:.4f})")
    
    if expected_dept:
        if predicted_dept == expected_dept:
            print(f"✅ PASS: Correctly routed to {expected_dept}")
        else:
            print(f"❌ FAIL: Expected {expected_dept}, but got {predicted_dept}")

if __name__ == "__main__":
    # Test 1: Image Categorization (EnHM)
    img_enhm = r"C:\Users\krish\.gemini\antigravity\brain\92223106-78df-4c27-982d-72b4355208dc\dirty_train_coach_1775666965350.png"
    run_test("Image-Only EnHM", image_path=img_enhm, expected_dept="EnHM")

    # Test 2: Image Categorization (Mechanical)
    img_mech = r"C:\Users\krish\.gemini\antigravity\brain\92223106-78df-4c27-982d-72b4355208dc\broken_train_seat_1775666981440.png"
    run_test("Image-Only Mechanical", image_path=img_mech, expected_dept="Mechanical")

    # Test 3: Text-Only (Electrical)
    run_test("Text-Only Electrical", text="The fan in my cabin is not working and the charging socket is loose.", expected_dept="Electrical")

    # Test 4: Text-Only (Security)
    run_test("Text-Only Security", text="Someone stole my bag near Nagpur station. Need RPF assistance.", expected_dept="Security")

    # Test 5: Multimodal (Catering)
    run_test("Multimodal Catering", text="The food served is stale and smelling bad.", image_path=img_enhm, expected_dept="Catering")
    # Note: Using dirty coach image as a proxy for 'bad smell' visual if it picked up food waste.
