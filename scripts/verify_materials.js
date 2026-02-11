const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5000/api';

async function runTest() {
    console.log("=== MATERIAL UPLOAD & SYNC TEST ===");

    // 1. Login as Admin to get Token
    let token = '';
    try {
        console.log("1. Logging in as Admin...");
        const loginRes = await axios.post(`${API_URL}/admin/login`, {
            adminId: 'BobbyFNB@09=',
            password: 'Martin@FNB09'
        });
        token = loginRes.data.token;
        console.log("   [SUCCESS] Token received.");
    } catch (e) {
        console.log("   [FAILED] Login error:", e.message);
        // Attempting to proceed without token if auth covers it or mock mode
    }

    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

    // 2. Create a Dummy File
    const filePath = path.join(__dirname, 'test_upload.txt');
    fs.writeFileSync(filePath, 'This is a test upload from the verification script.');

    // 3. Upload Material
    let materialId = '';
    try {
        console.log("2. Uploading Test Material...");
        const form = new FormData();
        form.append('file', fs.createReadStream(filePath));
        form.append('title', 'Automated Test Note');
        form.append('subject', 'Test Subject');
        form.append('type', 'notes');
        form.append('year', '1');
        form.append('section', 'A');
        form.append('branch', 'CSE');

        const uploadRes = await axios.post(`${API_URL}/materials`, form, {
            headers: {
                ...headers,
                ...form.getHeaders()
            }
        });

        console.log("   [SUCCESS] Uploaded. ID:", uploadRes.data.id || uploadRes.data._id);
        materialId = uploadRes.data.id || uploadRes.data._id;

        // Check Source
        if (uploadRes.data.source) console.log("   [INFO] Source:", uploadRes.data.source);

    } catch (e) {
        console.error("   [FAILED] Upload error:", e.message);
        if (e.response) console.error("   Response:", e.response.data);
    }

    // 4. Verify in List
    if (materialId) {
        try {
            console.log("3. Verifying Material Presence...");
            const listRes = await axios.get(`${API_URL}/materials`, { headers });
            const found = listRes.data.find(m => m.id === materialId || m._id === materialId);

            if (found) {
                console.log("   [SUCCESS] Material found in list.");
                console.log("   [INFO] Storage Type:", found.source || 'Unknown (likely DB/File merged)');
            } else {
                console.log("   [FAILED] Material NOT found in list.");
            }
        } catch (e) {
            console.error("   [FAILED] List fetch error:", e.message);
        }

        // 5. Delete Material
        try {
            console.log("4. Deleting Test Material...");
            await axios.delete(`${API_URL}/materials/${materialId}`, { headers });
            console.log("   [SUCCESS] Delete request sent.");

            // Double check
            const checkRes = await axios.get(`${API_URL}/materials`, { headers });
            const foundAgain = checkRes.data.find(m => m.id === materialId || m._id === materialId);
            if (!foundAgain) {
                console.log("   [SUCCESS] Verified deletion. Material is gone.");
            } else {
                console.log("   [FAILED] Material still exists in list.");
            }

        } catch (e) {
            console.error("   [FAILED] Delete error:", e.message);
        }
    }

    // Cleanup
    try { fs.unlinkSync(filePath); } catch (e) { }
    console.log("=== TEST COMPLETE ===");
}

runTest();
