export class Summary {
  static async list(sortBy = '-processed_date', limit = 10) {
    try {
      const response = await fetch(`http://localhost:8000/summaries?sort=${sortBy}&limit=${limit}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching summaries:', error);
      return [];
    }
  }
} 