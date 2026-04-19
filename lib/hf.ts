import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'number');
}

export async function generateMovieEmbedding(text: string): Promise<number[]> {
  try {
    console.log("   --- HF: Vector is Generating...");

    const output = await hf.featureExtraction({
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      inputs: text,
      options: { wait_for_model: true }
    });

    console.log("   --- HF: Vektör is Generated.");
    if (isNumberArray(output)) return output;
    if (Array.isArray(output) && output.length > 0 && isNumberArray(output[0])) return output[0];

    throw new Error('Unexpected embedding format from Hugging Face API.');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error("   --- HF ERROR:", message);
    throw error;
  }
}