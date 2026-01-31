#!/usr/bin/env node
// Script to load backend/knowledge modules and upsert into MongoDB

require('dotenv').config();
const path = require('path');
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/vu_ai_agent';

async function main() {
    console.log('[update_knowledge_db] Connecting to', MONGO_URI);
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const kbDir = path.join(__dirname, '..', 'knowledge');
    const toLoad = ['studentKnowledge.js', 'facultyKnowledge.js', 'adminKnowledge.js'];
    const loaded = {};

    for (const f of toLoad) {
        const full = path.join(kbDir, f);
        try {
            // clear cache
            try { delete require.cache[require.resolve(full)]; } catch (e) {}
            const mod = require(full);
            loaded[f.replace(/\.js$/, '')] = mod;
            console.log('[update_knowledge_db] Loaded', f);
        } catch (e) {
            console.warn('[update_knowledge_db] Could not load', f, e.message);
        }
    }

    const coll = mongoose.connection.collection('agentKnowledge');
    const now = new Date();
    const doc = { name: 'agent_knowledge', knowledge: loaded, updatedAt: now };

    try {
        await coll.updateOne({ name: 'agent_knowledge' }, { $set: doc }, { upsert: true });
        console.log('[update_knowledge_db] Upserted knowledge into collection agentKnowledge');
    } catch (e) {
        console.error('[update_knowledge_db] Failed to upsert:', e.message);
    } finally {
        await mongoose.disconnect();
        console.log('[update_knowledge_db] Done.');
    }
}

main().catch(err => { console.error(err); process.exit(1); });
