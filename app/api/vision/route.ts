import { NextResponse } from "next/server";
import vision from "@google-cloud/vision";

/**
 * By using Google Vision API, it detects label from the image url and returns a string with comma separated labels.
 */
async function getLabel(imageUrl: string): Promise<string> {
  const base64Image = imageUrl.replace(/^data:image\/(png|jpe?g);base64,/, "");
  const request = {
    image: {
      content: base64Image,
    },
  };
  console.log("Requesting Google Vision API...");
  const client = new vision.ImageAnnotatorClient({
    credentials: {
      client_email: process.env.GCLOUD_CLIENT_EMAIL,
      private_key: process.env.GCLOUD_PRIVATE_KEY?.replace(/\\n/g, "\n"), // replace is necessary if the system cannot include a newline in environment.
      client_id: process.env.GCLOUD_CLIENT_ID,
    },
  });
  const [result] = await client.labelDetection(request);
  const labels = result.labelAnnotations?.map((label) => label.description);
  console.log("Labels:", labels);
  const caption = labels?.join(", ");
  return caption || "";
}

/**
 * POST method receives a image URL and returns a JSON with the string caption
 * @param request
 */
export async function POST(request: Request) {
  const { imageUrl } = await request.json();

  let caption = "";

  try {
    caption = await getLabel(imageUrl);
    return NextResponse.json({
      caption,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({error: e});
  }
}
