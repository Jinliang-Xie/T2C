import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

type FilterType = { rec_id: { $in: string[] } } | Record<string | number | symbol, never>;

class SearchEsgTool extends DynamicStructuredTool {
  private email: string;
  private password: string;

  constructor({ email, password }: { email: string; password: string }) {
    super({
      name: 'Search_ESG_Tool',
      description:
        'Use this tool to perform semantic search on the ESG database for precise and specialized information.',
      schema: z.object({
        query: z.string().min(1).describe('Requirements or questions from the user.'),
        docIds: z.array(z.string()).optional().describe('Document ids to filter the search.'),
        topK: z.number().default(5).describe('Number of top chunk results to return.'),
        extK: z
          .number()
          .optional()
          .describe('Number of additional chunks to include before and after each topK result.'),
      }),
      func: async ({ query, docIds, topK }: { query: string; docIds: string[]; topK: number }) => {
        const filter: FilterType = docIds.length > 0 ? { rec_id: { $in: docIds } } : {};
        const isFilterEmpty = Object.keys(filter).length === 0;
        const requestBody = JSON.stringify(
          isFilterEmpty ? { query, topK } : { query, topK, filter },
        );

        const url = `${process.env.BASE_URL}/esg_search`;
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY ?? ''}`,
              email: this.email,
              password: this.password,
              'x-region': process.env.X_REGION ?? '',
            },
            body: requestBody,
          });
          if (!response.ok) {
            throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
          }
          const data = await response.json();
          return JSON.stringify(data);
        } catch (error) {
          console.error('Error making the request:', error);
          throw error;
        }
      },
    });

    this.email = email;
    this.password = password;
  }
}

export default SearchEsgTool;
