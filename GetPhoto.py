import requests
import pandas as pd
import time
# ==============================
# INSERT YOUR API KEY HERE 👇
API_KEY = "uBAILJNqyodVFUCyY4nBFOXiB1Y4Zk0_yWikmyhyudk"
# ==============================

headers = {"Authorization": f"Client-ID {API_KEY}"}

# 200 Hong Kong spots (from our earlier list)
spots = [
    "Museum of Art", "Cultural Centre", "Science Museum", "Space Museum",
    "Times Square Causeway Bay", "IFC Mall", "Mid-Levels Escalator",
    "Man Mo Temple", "Aberdeen Harbour", "Sunset Peak", "Tai Mo Shan",
    "Yuen Long", "Sha Tin", "Tai Po", "Kwun Tong", "Lei Yue Mun",
    "Golden Bauhinia Square", "Cat Street Market", "Pottinger Street",
    "Kowloon Bay", "Sky100 Observation Deck", "Bank of China Tower",
    "ICC Tower", "Western Market", "Sun Yat Sen Memorial Park",
    "Victoria Peak Garden", "Happy Valley Racecourse", "Jardine's Lookout",
    "Tai Hang", "Quarry Bay", "Sham Shui Po", "Prince Edward", "Yau Ma Tei",
    "Jordan", "Whampoa", "Maritime Museum", "Ma Wan Park Island",
    "Po Toi Islands", "Chek Lap Kok Airport", "Tseung Kwan O",
    "Clear Water Bay", "Shek Kip Mei", "Diamond Hill", "Tin Hau Temple",
    "Tai Kwun", "Central Harbourfront", "Monster Building", "Wan Chai",
    "Mid-Levels", "Western Promenade", "Flower Market", "Goldfish Market",
    "Bird Garden", "Sneakers Street", "Stanley Promenade",
    "Repulse Bay Beach", "Dragon Boat Festival", "Street Food Stalls",
    "Junk Boats", "Night View Victoria Harbour"
    
    
    
]

results = []

for spot in spots:
    url = "https://api.unsplash.com/search/photos"
    params = {"query": spot + " Hong Kong", "per_page": 1}
    r = requests.get(url, headers=headers, params=params).json()
    
    if r.get("results"):
        photo = r["results"][0]
        img_url = photo["urls"]["regular"]  # direct image URL
        photographer = photo["user"]["name"]
        results.append({"Spot Name": spot, "Direct Image URL": img_url, "Photographer": photographer})
    else:
        results.append({"Spot Name": spot, "Direct Image URL": "", "Photographer": ""})
    
    time.sleep(1)  # avoid hitting API rate limits

# Save to CSV
df = pd.DataFrame(results)
df.to_csv("hongkong_spots_200_3.csv", index=False, encoding="utf-8")

print("✅ CSV created: hongkong_spots_200.csv")
