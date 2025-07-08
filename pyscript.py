import requests
import json
from datetime import datetime

# API endpoint and settings
API_URL = 'https://data.cityofnewyork.us/resource/43nn-pn8j.json'
PAGE_SIZE = 5000
MAX_PAGES = 10  # You can raise this if needed

params_base = {
    '$where': "latitude IS NOT NULL AND longitude IS NOT NULL",
    '$order': "inspection_date DESC",
    '$limit': PAGE_SIZE
}

all_records = []

for i in range(MAX_PAGES):
    offset = i * PAGE_SIZE
    params = params_base.copy()
    params['$offset'] = offset

    print(f"🔄 Fetching records {offset + 1} to {offset + PAGE_SIZE}...")
    response = requests.get(API_URL, params=params)
    if response.status_code != 200:
        print("❌ Error:", response.status_code)
        print(response.text)
        break

    batch = response.json()
    if not batch:
        print("✅ Reached end of available records.")
        break

    all_records.extend(batch)

print(f"✅ Total records retrieved: {len(all_records)}")

# Deduplicate to latest inspection per CAMIS
latest_inspections = {}
for record in all_records:
    camis = record.get("camis")
    if not camis:
        continue

    date_str = record.get("inspection_date")
    try:
        date = datetime.strptime(date_str, "%Y-%m-%dT%H:%M:%S.%f")
    except:
        continue

    lat = record.get("latitude")
    lon = record.get("longitude")
    if not lat or not lon:
        continue

    if camis not in latest_inspections or date > latest_inspections[camis]['_parsed_date']:
        latest_inspections[camis] = {
            "dba": record.get("dba", "").title(),
            "borough": record.get("boro", ""),
            "cuisine_description": record.get("cuisine_description", ""),
            "grade": record.get("grade"),
            "inspection_date": date.strftime("%Y-%m-%d"),
            "violation_description": record.get("violation_description", ""),
            "latitude": float(lat),
            "longitude": float(lon),
            "_parsed_date": date
        }

# Clean internal fields
final_data = [
    {k: v for k, v in entry.items() if k != '_parsed_date'}
    for entry in latest_inspections.values()
]

with open("restaurants.json", "w", encoding="utf-8") as f:
    json.dump(final_data, f, indent=2)

print(f"📦 Saved {len(final_data)} unique, deduplicated restaurants to restaurants.json")
