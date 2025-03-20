import express, { Request, Response } from "express";
import cors, { CorsOptions } from "cors";
import bodyParser from "body-parser";
import fs from "fs";
import { parseStringPromise, Builder } from "xml2js";

const app = express();
const port = 3000;


app.use(cors());
app.use(express.json());

const notesFile = "notes.xml";

if (!fs.existsSync(notesFile)) {
    const defaultStruct = "<data></data>"; // Empty XML structure
    fs.writeFileSync(notesFile, defaultStruct);
}

const readFile = async (): Promise<any> => {
    const fileData = fs.readFileSync(notesFile, "utf8");
    return await parseStringPromise(fileData);
};


const writeFile = async (data: any) => {
    const builder = new Builder();
    const xml = builder.buildObject(data);
    fs.writeFileSync(notesFile, xml);
};


app.post("/addnote", async (req: Request, res: Response):Promise<any> => {
    const { topic, title, text } = req.body;
    if (!topic || !title || !text) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    let data = await readFile();

    if (!data.data) {
        data.data = {}
        
    }
    if (!data.data.topic) {
      data.data.topic = [];
    }

    let handledTopic = data.data.topic.find((t: any) => t.$?.name === topic);

    if (!handledTopic) {
      handledTopic = { $: { name: topic }, note: [] };
      data.data.topic.push(handledTopic);
    }
    const timestamp = new Date().toLocaleString("en-Gb")
    handledTopic.note.push({ $: { name: title }, text: text, timestamp: timestamp })

    await writeFile(data);

    res.json({ message: "Note added", topic, title, text, timestamp });
});

app.get("/getnotes/:topic", async (req: Request, res:Response):Promise<any>=> {
    const { topic } = req.params;
    let data = await readFile();

    if (!data.data || !data.data.topic) {
        return res.status(404).json({ error: "No notes found" });
    }

    const topicNode = data.data.topic.find((t: any) => t.$?.name === topic);
    if (!topicNode) {
        return res.status(404).json({ error: "Topic not found" });
    }

    res.json({ topic, notes: topicNode.note || [] });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});