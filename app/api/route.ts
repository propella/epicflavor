import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const response = {
        "result": new Date().toISOString(),
    }

    return NextResponse.json(response)
}

/**
 * POST method receives a image URL and returns a JSON with the string description
 * @param request
 */
export async function POST(request: Request) {
    const { imageUrl } = await request.json();
    const text = `happy face: ${new Date()}`;

    const response = {
        "result": text,
    };
    console.log({ imageUrl });
    return NextResponse.json(response);
}
