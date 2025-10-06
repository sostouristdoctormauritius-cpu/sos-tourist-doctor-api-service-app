const config = require('../config/config');
const dbManager = require('../db/dbManager');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

class SupabaseStorageService {
  constructor() {
    if (!config.supabase.url || !config.supabase.serviceRoleKey) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Supabase URL and Key are not configured.');
    }
    this.supabase = dbManager.getDbClient();
  }

  async uploadFile(fileBuffer, fileName, bucketName = 'files') {
    const { data, error } = await this.supabase.storage
      .from(bucketName)
      .upload(fileName, fileBuffer, {
        upsert: true
      });

    if (error) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error uploading file: ${error.message}`);
    }

    // Get public URL for the uploaded file
    const { data: urlData } = this.supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  }

  async deleteFile(filePath, bucketName = 'files') {
    const { error } = await this.supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error deleting file: ${error.message}`);
    }

    return true;
  }

  async getFileUrl(filePath, bucketName = 'files') {
    const { data, error } = this.supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, 3600); // URL valid for 1 hour

    if (error) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error getting file URL: ${error.message}`);
    }

    return data.signedUrl;
  }
}

module.exports = new SupabaseStorageService();
