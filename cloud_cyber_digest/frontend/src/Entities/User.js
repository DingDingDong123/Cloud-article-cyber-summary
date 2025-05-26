export class User {
  static async me() {
    try {
      const response = await fetch('http://localhost:8000/profile');
      return await response.json();
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }
} 