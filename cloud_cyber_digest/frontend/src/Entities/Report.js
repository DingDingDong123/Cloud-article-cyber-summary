export class Report {
  static async list(sortBy = '-created_date', limit = 5) {
    try {
      const response = await fetch(`http://localhost:8000/reports?sort=${sortBy}&limit=${limit}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching reports:', error);
      return [];
    }
  }
} 