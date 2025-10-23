let map, markers = [], sessions = [], characters = [], loot = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    loadData();
    showPage('sessions');
});

// MAP SETUP
function initMap() {
    map = L.map('map', { crs: L.CRS.Simple, minZoom: -1, maxZoom: 4 });
    const mapImg = L.imageOverlay('map.png', [[0, 0], [2000, 1500]]); // CHANGE TO YOUR PNG SIZE
    map.addLayer(mapImg);
    map.fitBounds([[0, 0], [2000, 1500]]);
    L.control.zoom({ position: 'topright' }).addTo(map);
    
    map.on('click', addMapPin);
    map.dragging.enable();
}

// MAP PIN
function addMapPin(e) {
    if (document.getElementById('party-book').classList.contains('hidden')) return;
    
    const marker = L.marker(e.latlng, {
        icon: L.divIcon({ className: 'custom-pin', html: '📍', iconSize: [25, 25] })
    }).addTo(map);
    
    marker.bindPopup(`
        <b>📍 New Location</b><br>
        ${Math.round(e.latlng.lat)}, ${Math.round(e.latlng.lng)}<br>
        <button onclick="addLocationToEntry(${e.latlng.lat}, ${e.latlng.lng})">Add to Journal</button>
    `).openPopup();
    
    markers.push({ marker, coords: [e.latlng.lat, e.latlng.lng] });
}

// BOOK FUNCTIONS
function toggleBook() {
    const book = document.getElementById('party-book');
    book.classList.toggle('hidden');
    if (!book.classList.contains('hidden')) map.dragging.disable();
    else map.dragging.enable();
}

function showPage(page) {
    document.querySelectorAll('.book-page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
    document.getElementById(page + '-page').classList.add('active');
    event.target.classList.add('active');
    if (page === 'locations') updateLocations();
    if (page === 'loot') updateTotalGold();
}

// SESSIONS
function newSession() {
    document.getElementById('modal-title').textContent = 'New Session';
    document.getElementById('entry-text').value = '';
    document.getElementById('entry-modal').classList.remove('hidden');
}

function saveEntry() {
    const text = document.getElementById('entry-text').value;
    if (!text.trim()) return;
    
    const session = {
        id: Date.now(),
        title: `Session #${sessions.length + 1}`,
        content: markdownToHtml(text),
        timestamp: new Date().toLocaleString(),
        raw: text
    };
    
    sessions.unshift(session);
    document.getElementById('sessions-content').innerHTML = sessions.map(renderSession).join('');
    closeModal();
    saveData();
}

function renderSession(session) {
    return `
        <div class="session-entry">
            <h3>${session.title} - ${session.timestamp}</h3>
            <div>${session.content}</div>
        </div>
    `;
}

function searchSessions() {
    const query = document.getElementById('search-sessions').value.toLowerCase();
    const filtered = sessions.filter(s => 
        s.raw.toLowerCase().includes(query) || s.title.toLowerCase().includes(query)
    );
    document.getElementById('sessions-content').innerHTML = filtered.map(renderSession).join('');
}

// CHARACTERS
function newCharacter() {
    const name = prompt('Character Name:');
    if (!name) return;
    const char = {
        id: Date.now(),
        name: name,
        class: prompt('Class:') || 'Adventurer',
        level: 1,
        hp: 10,
        avatar: '🗡️'
    };
    characters.push(char);
    document.getElementById('characters-content').innerHTML = characters.map(renderCharacter).join('');
    saveData();
}

function renderCharacter(char) {
    return `
        <div class="character-card">
            <div class="char-avatar">${char.avatar}</div>
            <div class="char-info">
                <h4>${char.name}</h4>
                <p><strong>Class:</strong> ${char.class} | <strong>Level:</strong> ${char.level}</p>
                <p><strong>HP:</strong> ${char.hp}</p>
            </div>
        </div>
    `;
}

// LOOT
function newLoot() {
    const item = prompt('Loot Item:');
    const gold = parseInt(prompt('Gold Value:') || 0);
    if (!item) return;
    
    loot.push({ item, gold });
    document.getElementById('loot-content').innerHTML = loot.map(renderLoot).join('');
    updateTotalGold();
    saveData();
}

function renderLoot(item) {
    return `<div class="loot-item">
        <span>${item.item}</span>
        <span>${item.gold}gp</span>
    </div>`;
}

function updateTotalGold() {
    const total = loot.reduce((sum, i) => sum + i.gold, 0);
    document.getElementById('total-gold').textContent = total;
}

// LOCATIONS
function updateLocations() {
    document.getElementById('locations-content').innerHTML = markers.map(m => 
        `<div class="session-entry">
            <h3>📍 ${m.coords[0]}, ${m.coords[1]}</h3>
            <p>Discovered: ${new Date().toLocaleString()}</p>
        </div>`
    ).join('');
}

function addLocationToEntry(lat, lng) {
    document.getElementById('entry-text').value += `\n📍 Location (${Math.round(lat)}, ${Math.round(lng)}): `;
}

// MODAL
function closeModal() { document.getElementById('entry-modal').classList.add('hidden'); }

// MARKDOWN
function markdownToHtml(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/_(.*?)_/g, '<u>$1</u>')
        .replace(/\n/g, '<br>')
        .replace(/^-\s+(.*$)/gm, '<li>$1</li>')
        .replace(/<li>/g, '<ul><li>').replace(/<\/li>/g, '</li></ul>');
}

// SAVE/LOAD (LocalStorage)
function saveData() {
    localStorage.setItem('dnd-sessions', JSON.stringify(sessions));
    localStorage.setItem('dnd-characters', JSON.stringify(characters));
    localStorage.setItem('dnd-loot', JSON.stringify(loot));
}

function loadData() {
    sessions = JSON.parse(localStorage.getItem('dnd-sessions') || '[]');
    characters = JSON.parse(localStorage.getItem('dnd-characters') || '[]');
    loot = JSON.parse(localStorage.getItem('dnd-loot') || '[]');
    
    document.getElementById('sessions-content').innerHTML = sessions.map(renderSession).join('');
    document.getElementById('characters-content').innerHTML = characters.map(renderCharacter).join('');
    document.getElementById('loot-content').innerHTML = loot.map(renderLoot).join('');
    updateTotalGold();
}
