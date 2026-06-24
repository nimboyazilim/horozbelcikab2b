import UserServices from '../services/userServices.mjs';

class UserController {
 

  async getUsers(req, res) {
    try {
      const users = await UserServices.getUsers(req);
      if (!users) {
        res.status(404).json({ message: 'No users found' });
      }
      return res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  // Get single user
  async getUser(req, res) {
    try {
      const user = await UserServices.getUser(req);
      if (!user) {
        res.status(404).json({ message: 'No user found' });
      }
      return res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  // Get user permissions
  async getUserYetki(req, res) {
    try {
      const yetki = await UserServices.getUserYetki(req);
      if (!yetki) {
        res.status(404).json({ message: 'No permissions found' });
      }
      return res.status(200).json(yetki);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  // Save user permissions
  async saveUserYetki(req, res) {
    try {
      const result = await UserServices.saveUserYetki(req);
      return res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  // Create new user
  async createUser(req, res) {
    try {
      const result = await UserServices.createUser(req);
      return res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  // Update user
  async updateUser(req, res) {
    try {
      const result = await UserServices.updateUser(req);
      return res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  // Delete user
  async deleteUser(req, res) {
    try {
      const result = await UserServices.deleteUser(req);
      return res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  // Get current user profile
  async getProfile(req, res) {
    try {
      const result = await UserServices.getProfile(req);
      if (result.status === 'error') {
        return res.status(404).json(result);
      }
      return res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  // Update current user profile
  async updateProfile(req, res) {
    try {
      const result = await UserServices.updateProfile(req);
      if (result.status === 'error') {
        return res.status(400).json(result);
      }
      return res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }
}

export default new UserController();