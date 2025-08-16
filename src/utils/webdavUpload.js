/**
 * WebDAV 图片上传服务
 * 支持直接上传图片到 WebDAV 服务器并转换为 Markdown 格式
 */

import { TICKET_CONFIG } from './baseConfig.js';

class WebDAVUploadService {
  constructor() {
    this.config = TICKET_CONFIG.imageUpload;
  }

  /**
   * 生成唯一的文件名
   * @param {File} file - 原始文件
   * @returns {string} 唯一文件名
   */
  generateUniqueFileName(file) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop();
    return `${timestamp}_${random}.${extension}`;
  }

  /**
   * 上传图片到 WebDAV 服务器
   * @param {File} file - 要上传的文件
   * @returns {Promise<Object>} 上传结果
   */
  async uploadToWebDAV(file) {
    const { webdav } = this.config;
    
    if (!webdav.serverUrl || !webdav.username || !webdav.password) {
      throw new Error('WebDAV 配置不完整');
    }

    const fileName = this.generateUniqueFileName(file);
    const uploadPath = `${webdav.uploadPath}/${fileName}`;
    const fullUrl = `${webdav.serverUrl}${uploadPath}`;

    // 创建 Basic Auth 认证头
    const credentials = btoa(`${webdav.username}:${webdav.password}`);
    
    try {
      const response = await fetch(fullUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': file.type,
          'Content-Length': file.size.toString()
        },
        body: file
      });

      if (!response.ok) {
        throw new Error(`WebDAV 上传失败: ${response.status} ${response.statusText}`);
      }

      // 生成公共访问URL
      const publicUrl = `${webdav.publicUrl}/${fileName}`;
      
      return {
        success: true,
        url: publicUrl,
        fileName: fileName,
        originalName: file.name,
        size: file.size
      };
    } catch (error) {
      console.error('WebDAV 上传错误:', error);
      throw error;
    }
  }

  /**
   * 上传图片到图床 API (支持多图床)
   * @param {File} file - 要上传的文件
   * @returns {Promise<Object>} 上传结果
   */
  async uploadToImageBed(file) {
    // 检查是否配置了多个图床
    if (this.config.imageBeds && this.config.imageBeds.length > 0) {
      return await this.uploadToMultipleImageBeds(file);
    } else {
      // 兼容旧配置 (单个图床)
      return await this.uploadToSingleImageBed(file);
    }
  }

  /**
   * 上传到多个图床 (支持故障转移)
   * @param {File} file - 要上传的文件
   * @returns {Promise<Object>} 上传结果
   */
  async uploadToMultipleImageBeds(file) {
    const { imageBeds, imageBedStrategy } = this.config;
    
    if (!imageBeds || imageBeds.length === 0) {
      throw new Error('未配置任何图床');
    }

    // 过滤启用的图床并按优先级排序
    const enabledImageBeds = imageBeds
      .filter(bed => bed.enabled)
      .sort((a, b) => a.priority - b.priority);

    if (enabledImageBeds.length === 0) {
      throw new Error('没有启用的图床');
    }

    // 根据策略选择图床顺序
    const selectedImageBeds = this.selectImageBedsByStrategy(enabledImageBeds, imageBedStrategy);

    // 尝试上传到每个图床
    for (let i = 0; i < selectedImageBeds.length; i++) {
      const imageBed = selectedImageBeds[i];
      
      try {
        console.log(`尝试上传到图床: ${imageBed.name}`);
        const result = await this.uploadToSpecificImageBed(file, imageBed);
        console.log(`成功上传到图床: ${imageBed.name}`);
        return result;
      } catch (error) {
        console.error(`图床 ${imageBed.name} 上传失败:`, error);
        
        // 如果不是最后一个图床且启用了故障转移，继续尝试下一个
        if (i < selectedImageBeds.length - 1 && imageBedStrategy.enableFailover) {
          console.log(`切换到下一个图床...`);
          await this.delay(imageBedStrategy.retryDelay);
          continue;
        } else {
          // 所有图床都失败了
          throw new Error(`所有图床上传都失败了: ${error.message}`);
        }
      }
    }
  }

  /**
   * 根据策略选择图床顺序
   * @param {Array} imageBeds - 图床列表
   * @param {Object} strategy - 选择策略
   * @returns {Array} 排序后的图床列表
   */
  selectImageBedsByStrategy(imageBeds, strategy) {
    switch (strategy.method) {
      case 'priority':
        // 按优先级排序 (已经在前面排序过了)
        return imageBeds;
        
      case 'round-robin':
        // 轮询选择 (这里简化处理，实际可以记录上次使用的图床)
        return imageBeds;
        
      case 'random':
        // 随机选择
        return [...imageBeds].sort(() => Math.random() - 0.5);
        
      default:
        return imageBeds;
    }
  }

  /**
   * 上传到单个图床 (兼容旧配置)
   * @param {File} file - 要上传的文件
   * @returns {Promise<Object>} 上传结果
   */
  async uploadToSingleImageBed(file) {
    const { imageBed } = this.config;
    
    if (!imageBed.apiUrl || !imageBed.apiKey) {
      throw new Error('图床配置不完整');
    }

    try {
      let result;
      
      // 根据图床类型选择不同的上传方式
      switch (imageBed.type) {
        case 'imgbb':
          result = await this.uploadToImgBB(file);
          break;
        case 'smms':
          result = await this.uploadToSMMS(file);
          break;
        case 'chevereto':
          result = await this.uploadToChevereto(file);
          break;
        case 'lsky':
          result = await this.uploadToLsky(file);
          break;
        case 'custom':
        default:
          result = await this.uploadToCustom(file);
          break;
      }
      
      return result;
    } catch (error) {
      console.error('图床上传错误:', error);
      throw error;
    }
  }

  /**
   * 上传到指定的图床
   * @param {File} file - 要上传的文件
   * @param {Object} imageBed - 图床配置
   * @returns {Promise<Object>} 上传结果
   */
  async uploadToSpecificImageBed(file, imageBed) {
    switch (imageBed.type) {
      case 'imgbb':
        return await this.uploadToImgBB(file, imageBed);
      case 'smms':
        return await this.uploadToSMMS(file, imageBed);
      case 'chevereto':
        return await this.uploadToChevereto(file, imageBed);
      case 'lsky':
        return await this.uploadToLsky(file, imageBed);
      case 'custom':
      default:
        return await this.uploadToCustom(file, imageBed);
    }
  }

  /**
   * 延迟函数
   * @param {number} ms - 延迟毫秒数
   * @returns {Promise} Promise对象
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 上传到 ImgBB
   */
  async uploadToImgBB(file, imageBed = null) {
    const config = imageBed || this.config.imageBed;
    
    const formData = new FormData();
    formData.append('image', file);
    formData.append('key', config.apiKey);

    const response = await fetch(config.apiUrl, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`ImgBB上传失败: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.success) {
      return {
        success: true,
        url: result.data.url,
        fileName: file.name,
        originalName: file.name,
        size: file.size
      };
    } else {
      throw new Error(result.error?.message || 'ImgBB上传失败');
    }
  }

  /**
   * 上传到 SM.MS
   */
  async uploadToSMMS(file, imageBed = null) {
    const config = imageBed || this.config.imageBed;
    
    const formData = new FormData();
    formData.append('smfile', file);

    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: config.headers || {},
      body: formData
    });

    if (!response.ok) {
      throw new Error(`SM.MS上传失败: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.success) {
      return {
        success: true,
        url: result.data.url,
        fileName: file.name,
        originalName: file.name,
        size: file.size
      };
    } else {
      throw new Error(result.message || 'SM.MS上传失败');
    }
  }

  /**
   * 上传到 Chevereto
   */
  async uploadToChevereto(file, imageBed = null) {
    const config = imageBed || this.config.imageBed;
    
    const formData = new FormData();
    formData.append('source', file);

    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: config.headers || {},
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Chevereto上传失败: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.status_code === 200) {
      return {
        success: true,
        url: result.data.url,
        fileName: file.name,
        originalName: file.name,
        size: file.size
      };
    } else {
      throw new Error(result.error?.message || 'Chevereto上传失败');
    }
  }

  /**
   * 上传到 Lsky Pro
   */
  async uploadToLsky(file, imageBed = null) {
    const config = imageBed || this.config.imageBed;
    
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: config.headers || {},
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Lsky上传失败: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.status) {
      return {
        success: true,
        url: result.data.url,
        fileName: file.name,
        originalName: file.name,
        size: file.size
      };
    } else {
      throw new Error(result.message || 'Lsky上传失败');
    }
  }

  /**
   * 自定义图床上传
   */
  async uploadToCustom(file, imageBed = null) {
    const config = imageBed || this.config.imageBed;
    
    const formData = new FormData();
    formData.append('image', file);
    
    // 添加自定义参数
    if (config.params) {
      Object.keys(config.params).forEach(key => {
        formData.append(key, config.params[key]);
      });
    }

    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: config.headers || {},
      body: formData
    });

    if (!response.ok) {
      throw new Error(`自定义图床上传失败: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    // 尝试从不同格式的响应中提取URL
    let imageUrl = null;
    if (result.url) {
      imageUrl = result.url;
    } else if (result.data && result.data.url) {
      imageUrl = result.data.url;
    } else if (result.link) {
      imageUrl = result.link;
    } else if (result.src) {
      imageUrl = result.src;
    }
    
    if (imageUrl) {
      return {
        success: true,
        url: imageUrl,
        fileName: file.name,
        originalName: file.name,
        size: file.size
      };
    } else {
      throw new Error('无法从响应中获取图片URL');
    }
  }

  /**
   * 上传图片（根据配置选择上传方式）
   * @param {File} file - 要上传的文件
   * @returns {Promise<Object>} 上传结果
   */
  async uploadImage(file) {
    if (!this.config.enabled) {
      throw new Error('图片上传功能已禁用');
    }

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      throw new Error('只支持图片文件');
    }

    // 验证文件大小
    if (file.size > this.config.maxSize) {
      throw new Error(`文件大小不能超过 ${this.formatFileSize(this.config.maxSize)}`);
    }

    try {
      let result;
      
      if (this.config.uploadMethod === 'webdav') {
        result = await this.uploadToWebDAV(file);
      } else if (this.config.uploadMethod === 'imagebed') {
        result = await this.uploadToImageBed(file);
      } else {
        throw new Error('不支持的上传方式');
      }

      // 转换为 Markdown 格式
      result.markdown = this.convertToMarkdown(result.url, file.name);
      
      return result;
    } catch (error) {
      console.error('图片上传失败:', error);
      throw error;
    }
  }

  /**
   * 将图片URL转换为图片链接格式
   * @param {string} url - 图片URL
   * @param {string} altText - 替代文本
   * @returns {string} 图片链接格式
   */
  convertToMarkdown(url, altText = '') {
    // 返回标准的markdown图片格式
    return `![${altText || '图片'}](${url})`;
  }

  /**
   * 格式化文件大小
   * @param {number} bytes - 字节数
   * @returns {string} 格式化后的大小
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 检查配置是否有效
   * @returns {boolean} 配置是否有效
   */
  isConfigValid() {
    if (!this.config.enabled) return false;
    
    if (this.config.uploadMethod === 'webdav') {
      const { webdav } = this.config;
      return !!(webdav.serverUrl && webdav.username && webdav.password && webdav.publicUrl);
    } else if (this.config.uploadMethod === 'imagebed') {
      // 检查多图床配置
      if (this.config.imageBeds && this.config.imageBeds.length > 0) {
        return this.config.imageBeds.some(bed => 
          bed.enabled && bed.apiUrl && bed.apiKey
        );
      }
      // 检查单个图床配置 (兼容旧配置)
      const { imageBed } = this.config;
      return !!(imageBed.apiUrl && imageBed.apiKey);
    }
    
    return false;
  }

  /**
   * 获取配置信息
   * @returns {Object} 配置信息
   */
  getConfigInfo() {
    return {
      enabled: this.config.enabled,
      uploadMethod: this.config.uploadMethod,
      maxFiles: this.config.maxFiles,
      maxSize: this.config.maxSize,
      configValid: this.isConfigValid()
    };
  }
}

// 创建单例实例
const webdavUploadService = new WebDAVUploadService();

export default webdavUploadService;
