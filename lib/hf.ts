import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export async function generateMovieEmbedding(text: string): Promise<number[]> {
  try {
    console.log("   --- HF: Vector is Generating...");

    const output = await hf.featureExtraction({
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      inputs: text,
      options: { wait_for_model: true }
    });

    console.log("   --- HF: Vektör is Generated.");
    return Array.from(output as number[]);
  } catch (error: any) {
    console.error("   --- HF ERROR:", error.message);
    throw error;
  }
}