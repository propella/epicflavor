import { NextResponse } from "next/server";
import { Configuration, OpenAIApi } from "openai";

async function getFlavorText(caption: string): Promise<string> {
  console.log("getFlavorText...");

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
  const { caption } = await request.json();

  try {
    const flavorText = await getFlavorText(caption);
    return NextResponse.json({
      flavorText,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e });
  }
}
