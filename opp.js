// **********************************************
// 1. IP მისამართის გარედან მოსაპოვებლად
// **********************************************
async function fetchIP() {
    try {
        // ვიყენებთ საჯარო API სერვისს გარე IP მისამართის მოსაპოვებლად (JSON ფორმატით)
        const response = await fetch('https://api.ipify.org?format=json'); 
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // ვავსებთ HTML-ის შესაბამის ველს
        document.getElementById('public_ip').textContent = data.ip || 'ვერ მოხერხდა IP-ის მიღება'; 
    } catch (error) {
        document.getElementById('public_ip').textContent = 'შეცდომა: ვერ მოხერხდა IP-ის მიღება (API ან ინტერნეტის პრობლემა).';
        console.error("IP Fetch Error:", error);
    }
}


// **********************************************
// 2. ბრაუზერის საბაზისო მონაცემების შეგროვებისთვის
// **********************************************
function collectBrowserData() {
    try {
        // User Agent
        document.getElementById('user_agent').textContent = navigator.userAgent;
        
        // ეკრანის გარჩევადობა
        document.getElementById('resolution').textContent = `${window.screen.width}x${window.screen.height} (შიდა: ${window.innerWidth}x${window.innerHeight})`;
        
        // ენა
        document.getElementById('language').textContent = navigator.language;
        
        // დროის სარტყელი
        document.getElementById('timezone').textContent = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (e) {
        console.error("Browser Data Collection Error:", e);
    }
}


// **********************************************
// 3. კანვასის ფინგერპრინტის გენერირება
// **********************************************
function generateCanvasFingerprint() {
    const canvas = document.getElementById('fingerprintCanvas');
    // შემოწმება, არსებობს თუ არა კანვასის ობიექტი
    if (!canvas) {
        document.getElementById('canvas_hash').textContent = 'შეცდომა: კანვასის ელემენტი ვერ მოიძებნა.';
        return;
    }
    
    try {
        const ctx = canvas.getContext('2d');
        
        // გრაფიკული ოპერაციები, რომლებიც უნიკალური შედეგის მისაღებად გამოიყენება
        ctx.textBaseline = "top";
        ctx.font = "14px 'Arial'";
        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = "#f60";
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = "#069";
        ctx.fillText("Test String for Fingerprinting 123", 2, 15);
        
        // პიქსელური მონაცემების Base64 სტრიქონში გადაყვანა
        const dataURL = canvas.toDataURL();
        
        // ჰეშის ველის შევსება Base64 სტრიქონის ნაწილით (რომელიც უნიკალურობას უზრუნველყოფს)
        document.getElementById('canvas_hash').textContent = dataURL.substring(0, 100) + '... (სრული ჰეში გრძელია)';

    } catch (e) {
        document.getElementById('canvas_hash').textContent = 'შეცდომა: ვერ მოხერხდა კანვასის რენდერინგი (დრაივერი/ბრაუზერის შეზღუდვა).';
        console.error("Canvas Fingerprinting Error:", e);
    }
}


// **********************************************
// 4. ყველა ფუნქციის გაშვება გვერდის ჩატვირთვისას
// **********************************************
document.addEventListener('DOMContentLoaded', () => {
    // 1. იტვირთება ბრაუზერის მონაცემები
    collectBrowserData();
    
    // 2. იტვირთება კანვასის ფინგერპრინტი
    generateCanvasFingerprint();
    
    // 3. იტვირთება გარე IP მისამართი
    fetchIP();
});