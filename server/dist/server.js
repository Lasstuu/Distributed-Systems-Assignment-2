"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const fs_1 = __importDefault(require("fs"));
const xml2js_1 = require("xml2js");
const app = (0, express_1.default)();
const port = 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const notesFile = "notes.xml";
if (!fs_1.default.existsSync(notesFile)) {
    const defaultStruct = "<data></data>"; // Empty XML structure
    fs_1.default.writeFileSync(notesFile, defaultStruct);
}
const readFile = async () => {
    const fileData = fs_1.default.readFileSync(notesFile, "utf8");
    return await (0, xml2js_1.parseStringPromise)(fileData);
};
const writeFile = async (data) => {
    const builder = new xml2js_1.Builder();
    const xml = builder.buildObject(data);
    fs_1.default.writeFileSync(notesFile, xml);
};
app.post("/addnote", async (req, res) => {
    const { topic, title, text } = req.body;
    if (!topic || !title || !text) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    let data = await readFile();
    if (!data.data) {
        data.data = {};
    }
    if (!data.data.topic) {
        data.data.topic = [];
    }
    let handledTopic = data.data.topic.find((t) => t.$?.name === topic);
    if (!handledTopic) {
        handledTopic = { $: { name: topic }, note: [] };
        data.data.topic.push(handledTopic);
    }
    const timestamp = new Date().toLocaleString("en-Gb");
    handledTopic.note.push({ $: { name: title }, text: text, timestamp: timestamp });
    await writeFile(data);
    res.json({ message: "Note added", topic, title, text, timestamp });
});
app.get("/getnotes/:topic", async (req, res) => {
    const { topic } = req.params;
    let data = await readFile();
    if (!data.data || !data.data.topic) {
        return res.status(404).json({ error: "No notes found" });
    }
    const topicNode = data.data.topic.find((t) => t.$?.name === topic);
    if (!topicNode) {
        return res.status(404).json({ error: "Topic not found" });
    }
    res.json({ topic, notes: topicNode.note || [] });
});
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
