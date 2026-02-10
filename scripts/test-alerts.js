const fetch = require('node-fetch');

async function testAlert() {
    console.log("Simulating VibeTracker Sentinel Run...");

    try {
        const res = await fetch('http://localhost:3000/api/sentinel', {
            method: 'GET',
        });

        const data = await res.json();
        console.log("Sentinel Response:", data);
    } catch (error) {
        console.error("Error testing sentinel:", error);
    }
}

testAlert();
