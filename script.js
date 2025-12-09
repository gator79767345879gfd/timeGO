const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// Load theme preference
const savedTheme = localStorage.getItem('theme') || 'light';
body.className = savedTheme;
themeToggle.textContent = savedTheme === 'light' ? '🌙' : '☀️';

themeToggle.addEventListener('click', () => {
    const newTheme = body.classList.contains('light') ? 'dark' : 'light';
    body.className = newTheme;
    themeToggle.textContent = newTheme === 'light' ? '🌙' : '☀️';
    localStorage.setItem('theme', newTheme);
});

function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

async function fetchQuote() {
    try {
        const response = await fetch('https://zenquotes.io/api/random');
        const data = await response.json();

        if (data && data.length > 0) {
            const quoteData = data[0];
            document.getElementById('quote').textContent = `"${quoteData.q}"`;
            document.getElementById('author').textContent = `— ${quoteData.a}`;

            // Cache the quote data with timestamp
            localStorage.setItem('cachedQuote', JSON.stringify({
                quote: quoteData.q,
                author: quoteData.a,
                timestamp: Date.now()
            }));
        }
    } catch (error) {
        console.error('Error fetching quote:', error);
        document.getElementById('quote').textContent = '"Time is what we want most but use worst."';
        document.getElementById('author').textContent = '— William Penn';
    }
}

function updateQuote() {
    const cached = localStorage.getItem('cachedQuote');
    const now = Date.now();

    if (cached) {
        const cachedData = JSON.parse(cached);
        const hoursSinceCached = (now - cachedData.timestamp) / (1000 * 60 * 60);

        // If cached quote is less than 1 hour old, use it
        if (hoursSinceCached < 1) {
            document.getElementById('quote').textContent = `"${cachedData.quote}"`;
            document.getElementById('author').textContent = `— ${cachedData.author}`;

            // Schedule next update at the top of next hour
            const msUntilNextHour = (60 - new Date().getMinutes()) * 60 * 1000;
            setTimeout(updateQuote, msUntilNextHour);
            return;
        }
    }

    // Fetch new quote
    fetchQuote();
}

function updateTime() {
    const now = new Date();

    // Time
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;

    const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} ${ampm}`;
    document.getElementById('time').textContent = timeString;

    // Date
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dateString = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
    document.getElementById('date').textContent = dateString;

    // Week number
    const weekNum = getWeekNumber(now);
    document.getElementById('weekNumber').textContent = `Week ${weekNum}`;

    // Day progress (24 hours)
    const dayProgress = ((now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) / 86400) * 100;
    document.getElementById('dayProgress').style.width = dayProgress + '%';
    document.getElementById('dayPercent').textContent = dayProgress.toFixed(1) + '%';

    // Week progress (7 days)
    const dayOfWeek = now.getDay(); // 0 = Sunday
    const weekProgress = ((dayOfWeek * 86400000 + now.getHours() * 3600000 + now.getMinutes() * 60000 + now.getSeconds() * 1000) / 604800000) * 100;
    document.getElementById('weekProgress').style.width = weekProgress + '%';
    document.getElementById('weekPercent').textContent = weekProgress.toFixed(1) + '%';

    // Month progress
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const monthProgress = ((now.getDate() - 1 + (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) / 86400) / daysInMonth) * 100;
    document.getElementById('monthProgress').style.width = monthProgress + '%';
    document.getElementById('monthPercent').textContent = monthProgress.toFixed(1) + '%';

    // Year progress (365 or 366 days)
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const daysInYear = (new Date(now.getFullYear() + 1, 0, 1) - startOfYear) / 86400000;
    const dayOfYear = Math.floor((now - startOfYear) / 86400000) + (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) / 86400;
    const yearProgress = (dayOfYear / daysInYear) * 100;
    document.getElementById('yearProgress').style.width = yearProgress + '%';
    document.getElementById('yearPercent').textContent = yearProgress.toFixed(1) + '%';
}

// Initialize quote on page load
updateQuote();

// Update quote every hour
setInterval(updateQuote, 3600000);

// Update time immediately and every second
updateTime();
setInterval(updateTime, 1000);