import { NextResponse } from 'next/server'
import vision from '@google-cloud/vision';
import { Configuration, OpenAIApi } from "openai";


export async function GET(request: Request) {
    const response = {
        "result": new Date().toISOString(),
    }

    return NextResponse.json(response)
}

/**
 * By using Google Vision API, it detects label from the image url
 */
async function getLabel(imageUrl: string): Promise<string> {
    // Imports the Google Cloud client library
    // const vision = require('@google-cloud/vision');

    console.log("getLabel...")
    const base64Image = imageUrl.replace(/^data:image\/(png|jpe?g);base64,/, "");
    const request = {
        image: {
            content: base64Image,
        },
    };
    // Creates a client
    const client = new vision.ImageAnnotatorClient(
        {
            credentials: {
                client_email: process.env.GCLOUD_CLIENT_EMAIL,
                private_key: process.env.GCLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                client_id: process.env.GCLOUD_CLIENT_ID,
            }
        }
    );
    const [result] = await client.labelDetection(request);
    // console.log({result});
    const labels = result.labelAnnotations;
    console.log('Labels:');
    // labels.forEach(label => console.log(label.description));
    const description = labels?.map((label) => label.description).join(", ")
    return description || "";
}

async function getFlavorText(caption: string): Promise<string> {
    console.log("getFlavorText...")

    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);

    const prompt = `フレーバーテキストとは、トレーディングカードゲームにおける用語で、
カードに書かれたテキストのうちゲームの進行そのものには関係しない、
もっぱら雰囲気づくりのために用意されているような文章のことである。

キーワード「${caption}」はある写真を表した物である。
これを元に日本語で詩的で饒舌なカード名とフレーバーテキストを一つずつ挙げ以下の書式で記述せよ。

カード名: (カード名)
(フレーバーテキスト)
`;

    const chatCompletion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo-0613",
        messages: [{ role: "user", content: prompt }],
    });
    console.log(chatCompletion.data.choices[0].message);
    const response = chatCompletion.data.choices[0].message?.content;
    return response || "";
}

/**
 * POST method receives a image URL and returns a JSON with the string description
 * @param request
 */
export async function POST(request: Request) {
    const { imageUrl } = await request.json();

    let description = "";
    let flavorText = "";

    try {
        description = await getLabel(imageUrl);
        flavorText = await getFlavorText(description);
    }
    catch (e) {
        console.error(e);
        return NextResponse.json(e);
    }

    const response = {
        "description": description,
        "result": flavorText,
    };
    return NextResponse.json(response);
}
