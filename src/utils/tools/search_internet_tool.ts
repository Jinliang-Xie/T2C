import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

class SearchInternetTool extends DynamicStructuredTool {
  private email: string;
  private password: string;

  constructor({ email, password }: { email: string; password: string }) {
    super({
      name: 'Search_Internet_Tool',
      description: 'Call this tool to search internet for up-to-date information.',
      schema: z.object({
        query: z.string().min(1).describe('Requirements or questions from the user.'),
        maxResults: z.number().default(5).describe('Number of results to return.'),
      }),
      func: async ({
        query,
        maxResults,
      }: {
        query: string;
        maxResults: number;
        email: string;
        password: string;
      }) => {
        const requestBody = JSON.stringify({ query, maxResults });

        const url = `${process.env.BASE_URL}/internet_search`;

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

export default SearchInternetTool;
