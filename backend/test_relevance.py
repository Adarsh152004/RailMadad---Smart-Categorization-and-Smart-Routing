import torch
from sentence_transformers import SentenceTransformer
import numpy as np

# Use the same list as main.py for consistency
DEPARTMENTS = [
    {"name": "EnHM", "trigger": "Dirty coach, Toilets, Trash, Garbage, Waste, Smell, Cleaning required, Water on floor, Filthy washroom"},
    {"name": "Electrical", "trigger": "Fan not working, Light, AC cooling, Charging Socket, Switch, Electrical issue, Fuse, Heat in coach"},
    {"name": "Mechanical", "trigger": "Broken seats, Windows, Berths, Door, Middle berth, Upper berth, Lever, Rattle noise, Loose handle"},
    {"name": "Catering", "trigger": "Food quality, Pantry, Hygiene, Stale meal, Overcharging, Water bottle, Meal service, Bad taste, Rodent in pantry"},
    {"name": "Security", "trigger": "Theft, Harassment, RPF help, Unauthorized person, Fighting, Safety, Luggage stolen, Suspicious activity, Nuisance"},
    {"name": "Non-Rail Issue", "trigger": "Random image, nature, pet, landscape, person face, unrelated, meme, street, building, car, office, desk, computer, beach, mountain, sky, sunset"}
]

print("🚀 Loading CLIP Model for Relevance Testing...")
model = SentenceTransformer('clip-ViT-B-32')

dept_labels = [d["name"] for d in DEPARTMENTS]
dept_triggers = [d["trigger"] for d in DEPARTMENTS]
dept_embeddings = model.encode(dept_triggers, convert_to_tensor=True)

def check_relevance(text):
    text_emb = model.encode(text, convert_to_tensor=True)
    cos_scores = torch.nn.functional.cosine_similarity(text_emb.unsqueeze(0), dept_embeddings)
    best_idx = torch.argmax(cos_scores).item()
    predicted_dept = dept_labels[best_idx]
    confidence = cos_scores[best_idx].item()
    
    is_valid = predicted_dept != "Non-Rail Issue" and confidence >= 0.15
    return predicted_dept, confidence, is_valid

test_cases = [
    "The toilet in coach B4 is very dirty and smelling.",
    "The fan is not working in my compartment.",
    "I want to report a theft of my mobile phone.",
    "A picture of a beautiful sunset at the beach.",
    "How to bake a chocolate cake at home?",
    "Broken window glass in S1 coach.",
    "The food served in the train is stale.",
    "Looking for a job in a software company.",
    "This is a random sentence about nothing."
]

print("\n--- RELEVANCE TEST RESULTS ---")
print(f"{'Input Text':<50} | {'Category':<15} | {'Conf':<6} | {'Status'}")
print("-" * 85)

for text in test_cases:
    dept, conf, valid = check_relevance(text)
    status = "✅ ACCEPTED" if valid else "❌ REJECTED"
    short_text = (text[:47] + '..') if len(text) > 47 else text
    print(f"{short_text:<50} | {dept:<15} | {conf:.3f} | {status}")
