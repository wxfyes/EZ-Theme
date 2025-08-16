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
   * @param {Function} onProgress - 进度回调函数
   * @returns {Promise<Object>} 上传结果
   */
  async uploadToWebDAV(file, onProgress) {
    const { webdav } = this.config;
    
    if (!webdav.serverUrl || !webdav.username || !webdav.password) {
      throw new Error('WebDAV 配置不完整');
    }

    const fileName = this.generateUniqueFileName(file);
    const uploadPath = `${webdav.uploadPath}/${fileName}`;
    const fullUrl = `${webdav.serverUrl}${uploadPath}`;

    // 创建 Basic Auth 认证头
    const credentials = btoa(`${webdav.username}:${webdav.password}`);
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // 监听上传进度
      if (onProgress && xhr.upload) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress(progress);
          }
        });
      }
      
      // 监听请求完成
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          // 生成公共访问URL
          const publicUrl = `${webdav.publicUrl}/${fileName}`;
          
          resolve({
            success: true,
            url: publicUrl,
            fileName: fileName,
            originalName: file.name,
            size: file.size
          });
        } else {
          reject(new Error(`WebDAV 上传失败: ${xhr.status} ${xhr.statusText}`));
        }
      });
      
      // 监听错误
      xhr.addEventListener('error', () => {
        reject(new Error('WebDAV 上传网络错误'));
      });
      
      // 监听超时
      xhr.addEventListener('timeout', () => {
        reject(new Error('WebDAV 上传超时'));
      });
      
      // 打开连接
      xhr.open('PUT', fullUrl);
      xhr.setRequestHeader('Authorization', `Basic ${credentials}`);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.setRequestHeader('Content-Length', file.size.toString());
      
      // 发送文件
      xhr.send(file);
    });
  }

  /**
   * 上传图片到图床 API (支持多图床)
   * @param {File} file - 要上传的文件
   * @param {Function} onProgress - 进度回调函数
   * @returns {Promise<Object>} 上传结果
   */
  async uploadToImageBed(file, onProgress) {
    // 检查是否配置了多个图床
    if (this.config.imageBeds && this.config.imageBeds.length > 0) {
      return await this.uploadToMultipleImageBeds(file, onProgress);
    } else {
      // 兼容旧配置 (单个图床)
      return await this.uploadToSingleImageBed(file, onProgress);
    }
  }

  /**
   * 上传到多个图床 (支持故障转移)
   * @param {File} file - 要上传的文件
   * @param {Function} onProgress - 进度回调函数
   * @returns {Promise<Object>} 上传结果
   */
  async uploadToMultipleImageBeds(file, onProgress) {
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
        const result = await this.uploadToSpecificImageBed(file, imageBed, onProgress);
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
   * @param {Function} onProgress - 进度回调函数
   * @returns {Promise<Object>} 上传结果
   */
  async uploadToSingleImageBed(file, onProgress) {
    const { imageBed } = this.config;
    
    if (!imageBed.apiUrl || !imageBed.apiKey) {
      throw new Error('图床配置不完整');
    }

    try {
      let result;
      
      // 根据图床类型选择不同的上传方式
      switch (imageBed.type) {
        case 'imgbb':
          result = await this.uploadToImgBB(file, null, onProgress);
          break;
        case 'smms':
          result = await this.uploadToSMMS(file, null, onProgress);
          break;
        case 'chevereto':
          result = await this.uploadToChevereto(file, null, onProgress);
          break;
        case 'lsky':
          result = await this.uploadToLsky(file, null, onProgress);
          break;
        case 'custom':
        default:
          result = await this.uploadToCustom(file, null, onProgress);
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
   * @param {Function} onProgress - 进度回调函数
   * @returns {Promise<Object>} 上传结果
   */
  async uploadToSpecificImageBed(file, imageBed, onProgress) {
    switch (imageBed.type) {
      case 'imgbb':
        return await this.uploadToImgBB(file, imageBed, onProgress);
      case 'smms':
        return await this.uploadToSMMS(file, imageBed, onProgress);
      case 'chevereto':
        return await this.uploadToChevereto(file, imageBed, onProgress);
      case 'lsky':
        return await this.uploadToLsky(file, imageBed, onProgress);
      case 'custom':
      default:
        return await this.uploadToCustom(file, imageBed, onProgress);
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
  async uploadToImgBB(file, imageBed = null, onProgress) {
    const config = imageBed || this.config.imageBed;
    
    const formData = new FormData();
    formData.append('image', file);
    formData.append('key', config.apiKey);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // 监听上传进度
      if (onProgress && xhr.upload) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress(progress);
          }
        });
      }
      
      // 监听请求完成
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText);
            if (result.success) {
              resolve({
                success: true,
                url: result.data.url,
                fileName: file.name,
                originalName: file.name,
                size: file.size
              });
            } else {
              reject(new Error(result.error?.message || 'ImgBB上传失败'));
            }
          } catch (error) {
            reject(new Error('ImgBB响应解析失败'));
          }
        } else {
          reject(new Error(`ImgBB上传失败: ${xhr.status} ${xhr.statusText}`));
        }
      });
      
      // 监听错误
      xhr.addEventListener('error', () => {
        reject(new Error('ImgBB上传网络错误'));
      });
      
      // 监听超时
      xhr.addEventListener('timeout', () => {
        reject(new Error('ImgBB上传超时'));
      });
      
      // 打开连接
      xhr.open('POST', config.apiUrl);
      
      // 发送数据
      xhr.send(formData);
    });
  }

  /**
   * 上传到 SM.MS
   */
  async uploadToSMMS(file, imageBed = null, onProgress) {
    const config = imageBed || this.config.imageBed;
    
    const formData = new FormData();
    formData.append('smfile', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // 监听上传进度
      if (onProgress && xhr.upload) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress(progress);
          }
        });
      }
      
      // 监听请求完成
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText);
            if (result.success) {
              resolve({
                success: true,
                url: result.data.url,
                fileName: file.name,
                originalName: file.name,
                size: file.size
              });
            } else {
              reject(new Error(result.message || 'SM.MS上传失败'));
            }
          } catch (error) {
            reject(new Error('SM.MS响应解析失败'));
          }
        } else {
          reject(new Error(`SM.MS上传失败: ${xhr.status} ${xhr.statusText}`));
        }
      });
      
      // 监听错误
      xhr.addEventListener('error', () => {
        reject(new Error('SM.MS上传网络错误'));
      });
      
      // 监听超时
      xhr.addEventListener('timeout', () => {
        reject(new Error('SM.MS上传超时'));
      });
      
      // 打开连接
      xhr.open('POST', config.apiUrl);
      
      // 设置请求头
      if (config.headers) {
        Object.keys(config.headers).forEach(key => {
          xhr.setRequestHeader(key, config.headers[key]);
        });
      }
      
      // 发送数据
      xhr.send(formData);
    });
  }

  /**
   * 上传到 Chevereto
   */
  async uploadToChevereto(file, imageBed = null, onProgress) {
    const config = imageBed || this.config.imageBed;
    
    const formData = new FormData();
    formData.append('source', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // 监听上传进度
      if (onProgress && xhr.upload) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress(progress);
          }
        });
      }
      
      // 监听请求完成
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText);
            if (result.status_code === 200) {
              resolve({
                success: true,
                url: result.data.url,
                fileName: file.name,
                originalName: file.name,
                size: file.size
              });
            } else {
              reject(new Error(result.error?.message || 'Chevereto上传失败'));
            }
          } catch (error) {
            reject(new Error('Chevereto响应解析失败'));
          }
        } else {
          reject(new Error(`Chevereto上传失败: ${xhr.status} ${xhr.statusText}`));
        }
      });
      
      // 监听错误
      xhr.addEventListener('error', () => {
        reject(new Error('Chevereto上传网络错误'));
      });
      
      // 监听超时
      xhr.addEventListener('timeout', () => {
        reject(new Error('Chevereto上传超时'));
      });
      
      // 打开连接
      xhr.open('POST', config.apiUrl);
      
      // 设置请求头
      if (config.headers) {
        Object.keys(config.headers).forEach(key => {
          xhr.setRequestHeader(key, config.headers[key]);
        });
      }
      
      // 发送数据
      xhr.send(formData);
    });
  }

  /**
   * 上传到 Lsky Pro
   */
  async uploadToLsky(file, imageBed = null, onProgress) {
    const config = imageBed || this.config.imageBed;
    
    const formData = new FormData();
    formData.append('file', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // 监听上传进度
      if (onProgress && xhr.upload) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress(progress);
          }
        });
      }
      
      // 监听请求完成
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText);
            if (result.status) {
              resolve({
                success: true,
                url: result.data.url,
                fileName: file.name,
                originalName: file.name,
                size: file.size
              });
            } else {
              reject(new Error(result.message || 'Lsky上传失败'));
            }
          } catch (error) {
            reject(new Error('Lsky响应解析失败'));
          }
        } else {
          reject(new Error(`Lsky上传失败: ${xhr.status} ${xhr.statusText}`));
        }
      });
      
      // 监听错误
      xhr.addEventListener('error', () => {
        reject(new Error('Lsky上传网络错误'));
      });
      
      // 监听超时
      xhr.addEventListener('timeout', () => {
        reject(new Error('Lsky上传超时'));
      });
      
      // 打开连接
      xhr.open('POST', config.apiUrl);
      
      // 设置请求头
      if (config.headers) {
        Object.keys(config.headers).forEach(key => {
          xhr.setRequestHeader(key, config.headers[key]);
        });
      }
      
      // 发送数据
      xhr.send(formData);
    });
  }

  /**
   * 自定义图床上传
   */
  async uploadToCustom(file, imageBed = null, onProgress) {
    const config = imageBed || this.config.imageBed;
    
    const formData = new FormData();
    formData.append('image', file);
    
    // 添加自定义参数
    if (config.params) {
      Object.keys(config.params).forEach(key => {
        formData.append(key, config.params[key]);
      });
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // 监听上传进度
      if (onProgress && xhr.upload) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress(progress);
          }
        });
      }
      
      // 监听请求完成
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText);
            
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
              resolve({
                success: true,
                url: imageUrl,
                fileName: file.name,
                originalName: file.name,
                size: file.size
              });
            } else {
              reject(new Error('无法从响应中获取图片URL'));
            }
          } catch (error) {
            reject(new Error('自定义图床响应解析失败'));
          }
        } else {
          reject(new Error(`自定义图床上传失败: ${xhr.status} ${xhr.statusText}`));
        }
      });
      
      // 监听错误
      xhr.addEventListener('error', () => {
        reject(new Error('自定义图床上传网络错误'));
      });
      
      // 监听超时
      xhr.addEventListener('timeout', () => {
        reject(new Error('自定义图床上传超时'));
      });
      
      // 打开连接
      xhr.open('POST', config.apiUrl);
      
      // 设置请求头
      if (config.headers) {
        Object.keys(config.headers).forEach(key => {
          xhr.setRequestHeader(key, config.headers[key]);
        });
      }
      
      // 发送数据
      xhr.send(formData);
    });
  }

  /**
   * 上传图片（根据配置选择上传方式）
   * @param {File} file - 要上传的文件
   * @param {Function} onProgress - 进度回调函数
   * @returns {Promise<Object>} 上传结果
   */
  async uploadImage(file, onProgress) {
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
        result = await this.uploadToWebDAV(file, onProgress);
      } else if (this.config.uploadMethod === 'imagebed') {
        result = await this.uploadToImageBed(file, onProgress);
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
