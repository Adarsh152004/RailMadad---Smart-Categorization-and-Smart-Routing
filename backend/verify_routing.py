import requests
import time

BASE_URL = "http://localhost:8000"

TEST_CASES = [
    {
        "dept": "Electrical",
        "description": "Fan not working in coach B1 and light is flickering. Very hot inside.",
        "pnr": "1234567890",
        "train": "12952",
        "coach": "B1"
    },
    {
        "dept": "Catering",
        "description": "The food served today was stale and smelled bad. Overcharged for water bottle.",
        "pnr": "2345678901",
        "train": "12432",
        "coach": "PC"
    },
    {
        "dept": "EnHM",
        "description": "Toilet is extremely dirty and water is overflowing onto the floor.",
        "pnr": "3456789012",
        "train": "12102",
        "coach": "S4"
    },
    {
        "dept": "Mechanical",
        "description": "Lower berth chain is broken and the window shutter is jammed.",
        "pnr": "4567890123",
        "train": "12245",
        "coach": "A2"
    },
    {
        "dept": "Security",
        "description": "Someone stole my bag from under the seat. Need RPF assistance.",
        "pnr": "5678901234",
        "train": "11020",
        "coach": "S1"
    }
]

def run_tests():
    print(f"\n🚀 STARTING DEPARTMENT ROUTING STRESS TEST\n{'='*50}")
    
    for i, case in enumerate(TEST_CASES, 1):
        print(f"\n[TEST {i}] Targeting {case['dept']}...")
        payload = {
            "pnr": case['pnr'],
            "train_number": case['train'],
            "coach_number": case['coach'],
            "description": case['description'],
            "phone_number": "9326897569" # Test phone
        }
        
        try:
            response = requests.post(f"{BASE_URL}/submit-complaint", data=payload)
            if response.status_code == 200:
                result = response.json()
                print(f"✅ SUCCESS | AI Categorized as: {result['category']} ({result['confidence']*100}%)")
                print(f"🔗 ID: {result['complaint_id']}")
            else:
                print(f"❌ FAILED | Status: {response.status_code}")
                print(f"Error: {response.text}")
        except Exception as e:
            print(f"💥 ERROR: {e}")
        
        time.sleep(2) # Prevent SMTP flooding

    print(f"\n{'='*50}\n🏁 ROUTING TEST COMPLETE. CHECK SYSTEM LOGS FOR DISPATCH VERIFICATION.")

if __name__ == "__main__":
    run_tests()
