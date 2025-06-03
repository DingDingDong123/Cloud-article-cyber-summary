export class Source {
  static async list(sortBy = '-created_date', limit = 10) {
    try {
      const response = await fetch(`http://localhost:8000/sources?sort=${sortBy}&limit=${limit}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching sources:', error);
      return [];
    }
  }

  static async create(sourceData) {
    try {
      const response = await fetch('http://localhost:8000/sources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sourceData),
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating source:', error);
      throw error;
    }
  }

  static async update(id, sourceData) {
    try {
      const response = await fetch(`http://localhost:8000/sources/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sourceData),
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating source:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      await fetch(`http://localhost:8000/sources/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting source:', error);
      throw error;
    }
  }
} 