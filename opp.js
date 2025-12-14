// **********************************************
// 1. ბრაუზერის მონაცემების შეგროვება
// **********************************************
function collectBrowserData() {
    // აგროვებს ყველა მონაცემს ობიექტში
    return {
        user_agent: navigator.userAgent,
        resolution: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        canvas_hash: generateCanvasFingerprint()
    };
}

// **********************************************
// 2. კანვასის ფინგერპრინტის გენერირება
// **********************************************
function generateCanvasFingerprint() {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    
    // რთული ნახატი
    ctx.textBaseline = "top";
    ctx.font = "14px 'Arial'";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = "#069";
    ctx.fillText("Test String for Fingerprinting 123", 2, 15);
    
    // დაბრუნება Base64 სტრიქონში
    return canvas.toDataURL();
}

// **********************************************
// 3. სერვერთან კომუნიკაცია და ისტორიის ჩვენება
// **********************************************
async function fetchDataAndDisplay() {
    const browserData = collectBrowserData();

    try {
        const response = await fetch('/api/get-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(browserData)
        });

        const data = await response.json();
        const current = data.current_visit;
        const history = data.history;

        // აჩვენეთ მიმდინარე მონაცემები
        document.getElementById('public_ip').textContent = current.public_ip;
        document.getElementById('geolocation').textContent = 
            `ქვეყანა: ${current.geolocation.country || 'N/A'}, ISP: ${current.geolocation.isp || 'N/A'}`;
        document.getElementById('user_agent').textContent = current.user_agent;
        document.getElementById('resolution').textContent = current.resolution;
        document.getElementById('language').textContent = current.language;
        document.getElementById('timezone').textContent = current.timezone;
        document.getElementById('canvas_hash').textContent = current.canvas_hash.substring(0, 100) + '...';

        // აჩვენეთ ისტორია (დაგჭირდებათ ისტორიის ბლოკი HTML-ში)
        displayHistory(history);

    } catch (error) {
        console.error("Data Fetch Error:", error);
        document.getElementById('public_ip').textContent = 'შეცდომა: ვერ დაუკავშირდა სერვერს.';
    }
}

// ისტორიის ჩვენების ფუნქცია (უბრალო მაგალითი)
function displayHistory(history) {
    const historyElement = document.getElementById('history_log');
    if (!historyElement) return;

    historyElement.innerHTML = '<h3>ბოლო 5 ვიზიტი:</h3>';
    history.slice(0, 5).forEach((item, index) => {
        historyElement.innerHTML += `
            <p>
                <strong>№${index + 1} (${item.timestamp}):</strong> 
                IP: ${item.public_ip}, 
                ქვეყანა: ${item.geolocation.country}, 
                ჰეში: ${item.canvas_hash ? item.canvas_hash.substring(0, 20) + '...' : 'N/A'}
            </p>
        `;
    });
}


// **********************************************
// 4. გაშვება
// **********************************************
document.addEventListener('DOMContentLoaded', fetchDataAndDisplay);