import json
import os

JSON_FILE = r"c:\Users\moham\Downloads\my-newsletter-site\data\newsletters.json"

def main():
    with open(JSON_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    newsletters = data.get('newsletters', [])
    
    # Filter out the specific duplicate ID
    # Keep '2025-12-02-harvard-ml-systems'
    # Remove '2025-12-02-harvard-released-a-free-book-on-ml-systems-engineering'
    
    new_newsletters = [
        n for n in newsletters 
        if n['id'] != '2025-12-02-harvard-released-a-free-book-on-ml-systems-engineering'
    ]
    
    print(f"Removed {len(newsletters) - len(new_newsletters)} entries.")
    
    data['newsletters'] = new_newsletters
    
    with open(JSON_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4)
        
    print("Cleanup complete.")

if __name__ == "__main__":
    main()
