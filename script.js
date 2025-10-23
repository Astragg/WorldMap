// Initialize INTERACTIVE MAP
let map, markers = [];
let mapClicked = false;

document.addEventListener('DOMContentLoaded', () => {
    initMap();
});

function initMap() {
    // Create map
    map = L.map('map', {
        crs: L.CRS.Simple,  // For PNG images
        minZoom: -1,
        maxZoom: 4
    });

    // Load your PNG map
    const mapImg = L.imageOverlay('map.png', [[0, 0], [1000, 1000]]); // Adjust [width, height] to your PNG size
    map.addLayer(mapImg);

    // Fit map to image bounds
    const bounds = [[0, 0], [1000, 1000]];
    map.fitBounds(bounds);

    // Enable zoom controls
    L.control.zoom({ position: 'topright' }).addTo(map);

    // CLICK TO ADD PINS
    map.on('click', function(e) {
        if (!document.getElementById('party-book').classList.contains('hidden')) {
            addMarker(e.latlng);
        }
    });

    // Enable dragging
    map.dragging.enable();
}

// ADD PIN ON MAP
function addMarker(latlng) {
    const marker = L.marker(latlng, {
        icon: L.divIcon({
            className: 'custom-pin',
            html: '📍',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        })
    }).addTo(map);

    // Popup with location info
    marker.bindPopup(`
        <h3>📍 New Location</h3>
        <p>Coords: ${Math.round(latlng.lat)}, ${Math.round(latlng.lng)}</p>
        <button onclick="addToJournal('${latlng.lat}', '${latlng.lng}')">Add to Journal</button>
    `).openPopup();

    markers.push(marker);
}

// ADD LOCATION TO JOURNAL TEXTAREA
function addToJournal(lat, lng) {
    document.getElementById('new-entry').value += `\n📍 Location (${Math.round(lat)}, ${Math.round(lng)}): `;
    document.getElementById('new-entry').focus();
}

// Toggle Party Book
function toggleBook() {
    const book = document.getElementById('party-book');
    book.classList.toggle('hidden');
    if (!book.classList.contains('hidden')) {
        map.dragging.disable();  // Disable map drag while book open
    } else {
        map.dragging.enable();   // Re-enable when closed
    }
}

// Add New Entry (SAME AS BEFORE)
function addEntry() {
    const text = document.getElementById('new-entry').value;
    if (!text.trim()) return;
    
    const entry = createEntry(text);
    document.getElementById('journal-content').insertBefore(entry, document.getElementById('journal-content').firstChild);
    document.getElementById('new-entry').value = '';
}

// Create HTML Entry from Markdown
function createEntry(text) {
    const div = document.createElement('div');
    div.className = 'entry';
    
    let html = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/_(.*?)_/g, '<u>$1</u>')
        .replace(/\n/g, '<br>')
        .replace(/^-\s+(.*$)/gm, '<ul><li>$1</li></ul>')
        .replace(/<\/ul>/g, '</li></ul>');
    
    const now = new Date().toLocaleString();
    div.innerHTML = `<h3>Entry - ${now}</h3><p>${html}</p>`;
    
    return div;
}

// Save to GitHub (SAME AS BEFORE)
function saveJournal() {
    const content = document.getElementById('journal-content').innerHTML;
    const mdContent = htmlToMarkdown(content);
    
    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'party-journal.md';
    a.click();
    
    alert('📝 Download saved! Upload party-journal.md to your GitHub repo!');
}

function htmlToMarkdown(html) {
    return html
        .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
        .replace(/<em>(.*?)<\/em>/g, '*$1*')
        .replace(/<u>(.*?)<\/u>/g, '_$1_')
        .replace(/<br>/g, '\n')
        .replace(/<li>(.*?)<\/li>/g, '- $1\n');
}
