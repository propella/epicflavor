import { NextResponse } from 'next/server'
import vision from '@google-cloud/vision';

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
    const base64Image = imageUrl.replace(/^data:image\/(png|jpg);base64,/, "");
    const request = {
        image: {
          content: base64Image,
        }
      };

    // Creates a client
    const client = new vision.ImageAnnotatorClient(
        {
            credentials: {
                quota_project_id: "epicflavor",
                type: "authorized_user",
                client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
                client_secret: process.env.NEXT_PUBLIC_CLIENT_SECRET,
                refresh_token: process.env.NEXT_PUBLIC_REFRESH_TOKEN,
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

/**
 * POST method receives a image URL and returns a JSON with the string description
 * @param request
 */
export async function POST(request: Request) {
    const { imageUrl } = await request.json();
    const text = `happy face: ${new Date()}`;
    const description = await getLabel(imageUrl);

    const response = {
        "result": description,
    };
    // console.log({ imageUrl });
    return NextResponse.json(response);
}
