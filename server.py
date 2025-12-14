from flask import Flask, render_template, request, jsonify, send_from_directory
import json
import os
import requests

app = Flask(__name__)

# მონაცემთა ბაზის ფაილი
HISTORY_FILE = 'history.json'

def load_history():
    """ისტორიის ჩატვირთვა JSON ფაილიდან"""
    if not os.path.exists(HISTORY_FILE):
        return []
    with open(HISTORY_FILE, 'r') as f:
        return json.load(f)

def save_history(history):
    """ისტორიის შენახვა JSON ფაილში"""
    with open(HISTORY_FILE, 'w') as f:
        json.dump(history, f, indent=4)

@app.route('/')
def index():
    """მთავარი გვერდის ჩვენება"""
    return render_template('index.html')

@app.route('/api/get-data', methods=['POST'])
def get_data():
    """
    IP, გეოლოკაციის და ისტორიის შენახვა/დაბრუნება.
    
    Front-end აგზავნის ბრაუზერის მონაცემებს (ფინგერპრინტს) POST მოთხოვნით,
    სერვერი ამატებს IP-ს, ინახავს ისტორიას და აბრუნებს ყველაფერს.
    """
    client_ip = request.headers.get('X-Forwarded-For', request.remote_addr)
    
    # 1. გეოლოკაციის მონაცემების მოპოვება (API-ის გამოყენებით)
    # (გამოიყენეთ ნებისმიერი უფასო Geolocation API)
    geo_data = {}
    try:
        geo_response = requests.get(f'http://ip-api.com/json/{client_ip}')
        if geo_response.status_code == 200:
            geo_data = geo_response.json()
    except Exception as e:
        print(f"Geolocation Error: {e}")
        
    # 2. მონაცემთა ობიექტის შექმნა
    current_data = request.json
    current_data['timestamp'] = os.popen('date /t').read().strip()
    current_data['public_ip'] = client_ip
    current_data['geolocation'] = {
        'country': geo_data.get('country'),
        'isp': geo_data.get('isp'),
        'city': geo_data.get('city')
    }
    
    # 3. ისტორიის ჩატვირთვა, შენახვა და შენახვა
    history = load_history()
    history.insert(0, current_data) # დამატება დასაწყისში
    if len(history) > 20:
        history.pop() # მაქსიმუმ 20 ჩანაწერი
    save_history(history)
    
    # 4. Front-end-ისთვის მონაცემების დაბრუნება (მიმდინარე და ისტორია)
    return jsonify({
        'current_visit': current_data,
        'history': history
    })

# Render-ისთვის: სერვერის გაშვება
if __name__ == '__main__':
    # Flask ეძებს HTML ფაილებს საქაღალდეში 'templates'
    if not os.path.exists('templates'):
        os.makedirs('templates')
    
    # Render იყენებს პორტს, რომელიც მითითებულია გარემოს ცვლადში
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)