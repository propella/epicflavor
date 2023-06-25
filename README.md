# EpicFlavor - Capture the world, transform it into an epic story.

EpicFlavor is a unique web application that harnesses the power of AI to transform the ordinary into the extraordinary. It lets users capture images using their mobile camera, which are then processed through a state-of-the-art image recognition system. But the magic doesn't stop there. EpicFlavor takes the concept further by using OpenAI's GPT model to generate a trading card game style "flavor text" based on the recognized objects from the images. Each image spawns an epic saga, a fantastical tale, or a magical lore, making every capture a gateway to imagination.

## Getting Started

### Configure API Keys

* Get a Google Vision API Key for Service Account:
    * Visit https://console.cloud.google.com/projectcreate and create a project.
    * Visit https://console.developers.google.com/apis/api/vision.googleapis.com/overview and enable Vison API.
    * Visit https://console.cloud.google.com/iam-admin/serviceaccounts and create a service account.
        * Give role AI Platform Admin (roles/ml.admin)
        * Add Key and download a JSON file
* Get an OpenAI API Key: https://platform.openai.com/account/api-keys

Copy .env.local.example to .env.local and fill in the API keys.

### Run the Development Server

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
