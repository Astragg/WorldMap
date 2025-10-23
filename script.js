// Toggle Party Book
function toggleBook() {
    const book = document.getElementById('party-book');
    book.classList.toggle('hidden');
}

// Add New Entry
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
    
    // Simple Markdown Parser
    let html = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/_(.*?)_/g, '<u>$1</u>')
        .replace(/\n/g, '<br>')
        .replace(/^-\s+(.*$)/gm, '<ul><li>$1</li></ul>')
        .replace(/<\/ul>/g, '</li></ul>');
    
    // Add timestamp
    const now = new Date().toLocaleString();
    div.innerHTML = `<h3>Entry - ${now}</h3><p>${html}</p>`;
    
    return div;
}

// Save to GitHub (Creates party-journal.md file)
function saveJournal() {
    const content = document.getElementById('journal-content').innerHTML;
    const mdContent = htmlToMarkdown(content);
    
    // This creates a downloadable file - Upload manually to GitHub
    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'party-journal.md';
    a.click();
    
    alert('📝 Download saved! Upload party-journal.md to your GitHub repo to share with party.');
}

// Simple HTML to Markdown (for GitHub storage)
function htmlToMarkdown(html) {
    return html
        .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
        .replace(/<em>(.*?)<\/em>/g, '*$1*')
        .replace(/<u>(.*?)<\/u>/g, '_$1_')
        .replace(/<br>/g, '\n')
        .replace(/<li>(.*?)<\/li>/g, '- $1\n')
        .replace(/<ul>.*?<\/ul>/g, '');
}

// Load from GitHub file on page load (optional)
document.addEventListener('DOMContentLoaded', () => {
    // If you have party-journal.md in repo, fetch it:
    // fetch('party-journal.md').then(r => r.text()).then(md => {
    //     document.getElementById('journal-content').innerHTML = markdownToHtml(md);
    // });
});

// BONUS: Click map to add location notes
document.getElementById('world-map').addEventListener('click', (e) => {
    if (!document.getElementById('party-book').classList.contains('hidden')) {
        const x = e.clientX / window.innerWidth * 100;
        const y = e.clientY / window.innerHeight * 100;
        document.getElementById('new-entry').value += `\n\n📍 Location (${Math.round(x)}%, ${Math.round(y)}%): `;
    }
});
