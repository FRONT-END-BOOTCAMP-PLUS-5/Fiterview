import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const response = await openai.responses.create({
  model: 'gpt-4o-mini-transcribe',
  input: [
    {
      role: 'user',
      content: [
        { type: 'input_text', text: "what's in this image?" },
        {
          type: 'input_image',
          image_url:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg',
          detail: 'high',
        },
      ],
    },
  ],
});

console.log(response);

export default function TestPage() {
  return <div>{response.output_text}</div>;
}
