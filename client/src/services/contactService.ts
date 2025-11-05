import api from '../lib/api';

export interface ContactMessageData {
  name: string;
  email: string;
  message: string;
}

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  message: string;
  status: 'unread' | 'read';
  adminReply?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessagesResponse {
  success: boolean;
  message: string;
  data: {
    messages: ContactMessage[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface SendMessageResponse {
  success: boolean;
  message: string;
  data?: {
    messageId: string;
  };
}

export const contactService = {
  // Send contact message (public)
  sendMessage: async (data: ContactMessageData): Promise<SendMessageResponse> => {
    try {
      const response = await api.post('/api/contact/send', data);
      return response as unknown as SendMessageResponse;
    } catch (error) {
      console.error('Failed to send contact message:', error);
      throw error;
    }
  },

  // Admin: Get all contact messages
  getMessages: async (page: number = 1, limit: number = 10, status?: 'read' | 'unread'): Promise<ContactMessagesResponse> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (status) {
        params.append('status', status);
      }

      const response = await api.get(`/api/admin/messages?${params.toString()}`);
      return response as unknown as ContactMessagesResponse;
    } catch (error) {
      console.error('Failed to fetch contact messages:', error);
      throw error;
    }
  },

  // Admin: Get single message
  getMessageById: async (messageId: string): Promise<ContactMessage> => {
    try {
      const response = await api.get(`/api/admin/messages/${messageId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch message:', error);
      throw error;
    }
  },

  // Admin: Mark message as read
  markAsRead: async (messageId: string): Promise<void> => {
    try {
      await api.patch(`/api/admin/messages/${messageId}`, { status: 'read' });
    } catch (error) {
      console.error('Failed to mark message as read:', error);
      throw error;
    }
  },

  // Admin: Delete message
  deleteMessage: async (messageId: string): Promise<void> => {
    try {
      await api.patch(`/api/admin/messages/${messageId}`, { action: 'delete' });
    } catch (error) {
      console.error('Failed to delete message:', error);
      throw error;
    }
  },

  // Admin: Add reply to message
  addReply: async (messageId: string, reply: string): Promise<void> => {
    try {
      await api.patch(`/api/admin/messages/${messageId}`, { 
        adminReply: reply,
        status: 'read'
      });
    } catch (error) {
      console.error('Failed to add reply:', error);
      throw error;
    }
  },
};
