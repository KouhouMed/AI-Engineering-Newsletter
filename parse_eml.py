import os
import json
import email
from email import policy
from email.parser import BytesParser
from datetime import datetime
import re
from bs4 import BeautifulSoup

DATA_DIR = r"c:\Users\moham\Downloads\my-newsletter-site\data"
JSON_FILE = os.path.join(DATA_DIR, "newsletters.json")

def parse_date(date_str):
    try:
        # Example: Tue, 02 Dec 2025 13:33:51 +0000 (UTC)
        dt = email.utils.parsedate_to_datetime(date_str)
        return dt.strftime("%Y-%m-%d")
    except Exception as e:
        print(f"Error parsing date {date_str}: {e}")
        return datetime.now().strftime("%Y-%m-%d")

def slugify(text):
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    text = text.strip('-')
    return text

def extract_html_content(msg):
    html_content = ""
    if msg.is_multipart():
        for part in msg.walk():
            if part.get_content_type() == "text/html":
                html_content = part.get_content()
                break
    else:
        if msg.get_content_type() == "text/html":
            html_content = msg.get_content()
    
    # If no HTML found, try to use plain text and wrap in <p>
    if not html_content:
        for part in msg.walk():
            if part.get_content_type() == "text/plain":
                text = part.get_content()
                html_content = f"<p>{text}</p>"
                break
    return html_content

def generate_summary(html_content):
    soup = BeautifulSoup(html_content, 'html.parser')
    # Try to find the first paragraph or list item
    text = soup.get_text(separator=' ', strip=True)
    # Take first 200 chars as summary
    summary = text[:200] + "..." if len(text) > 200 else text
    return summary

def generate_tags(title):
    tags = []
    title_lower = title.lower()
    keywords = {
        "agent": "Agents",
        "context": "Context Engineering",
        "ocr": "OCR",
        "deepseek": "DeepSeek",
        "gemini": "Gemini",
        "google": "Google",
        "llm": "LLM",
        "diffusion": "Diffusion Models",
        "sql": "SQL",
        "memory": "Memory",
        "harvard": "Harvard",
        "book": "Education",
        "systems": "Systems",
        "open source": "Open Source",
        "fine-tune": "Fine-tuning",
        "training": "Training"
    }
    
    for key, tag in keywords.items():
        if key in title_lower:
            tags.append(tag)
            
    if not tags:
        tags.append("AI")
        
    return list(set(tags))

def main():
    # Load existing newsletters
    if os.path.exists(JSON_FILE):
        with open(JSON_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
            existing_ids = {item['id'] for item in data.get('newsletters', [])}
            newsletters = data.get('newsletters', [])
    else:
        existing_ids = set()
        newsletters = []

    # Process EML files
    for filename in os.listdir(DATA_DIR):
        if filename.endswith(".eml"):
            filepath = os.path.join(DATA_DIR, filename)
            print(f"Processing {filename}...")
            
            with open(filepath, 'rb') as f:
                msg = BytesParser(policy=policy.default).parse(f)
            
            subject = msg['subject']
            date_str = msg['date']
            formatted_date = parse_date(date_str)
            
            # Generate ID
            slug = slugify(subject)
            newsletter_id = f"{formatted_date}-{slug}"
            
            if newsletter_id in existing_ids:
                print(f"Skipping {newsletter_id} (already exists)")
                continue
            
            html_content = extract_html_content(msg)
            
            # Clean up HTML content - remove full HTML structure if present, keep body
            # Or just keep it as is if the frontend handles it. 
            # Usually better to extract body content.
            soup = BeautifulSoup(html_content, 'html.parser')
            body = soup.find('body')
            if body:
                html_content = "".join([str(x) for x in body.contents])
            
            summary = generate_summary(html_content)
            tags = generate_tags(subject)
            
            new_entry = {
                "id": newsletter_id,
                "title": subject,
                "date": formatted_date,
                "summary": summary,
                "tags": tags,
                "content_html": html_content
            }
            
            newsletters.append(new_entry)
            print(f"Added {newsletter_id}")

    # Save updated newsletters
    with open(JSON_FILE, 'w', encoding='utf-8') as f:
        json.dump({"newsletters": newsletters}, f, indent=4)
    
    print("Done!")

if __name__ == "__main__":
    main()
