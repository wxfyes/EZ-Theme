<template>
  <div class="image-upload-container">
    <!-- 配置状态提示 -->
    <div v-if="!isConfigValid" class="config-warning">
      <IconAlertCircle :size="16" />
      <span>{{ $t('imageUpload.configInvalid') }}</span>
    </div>

    <!-- 图片预览区域 -->
    <div class="image-preview-area" v-if="images.length > 0" :key="'preview-' + images.length">
      <div 
        v-for="(image, index) in images" 
        :key="image.id || index"
        class="image-preview-item"
      >
        <img :src="image.url" :alt="`图片 ${index + 1}`" class="preview-image" />
        <div class="image-overlay">
          <button class="remove-btn" @click="removeImage(index)">
            <IconX :size="16" />
          </button>
          <button 
            v-if="image.markdown" 
            class="copy-markdown-btn" 
            @click="copyMarkdown(image.markdown)"
            :title="$t('imageUpload.copyMarkdown')"
          >
            <IconCopy :size="14" />
          </button>
        </div>
        <div class="upload-progress" v-if="image.uploading || image.progress > 0" :key="'progress-' + image.id">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: image.progress + '%' }"></div>
          </div>
          <span class="progress-text">{{ Math.round(image.progress) }}%</span>
        </div>
        <div v-if="image.markdown" class="markdown-indicator">
          <IconCode :size="12" />
        </div>
      </div>
    </div>

    <!-- 上传区域 -->
    <div 
      class="upload-area"
      :class="{ 
        'drag-over': isDragOver, 
        'has-images': images.length > 0,
        'disabled': disabled || !isConfigValid
      }"
      @click="triggerFileInput"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <div class="upload-content">
        <IconUpload :size="32" class="upload-icon" />
        <p class="upload-text">{{ uploadText }}</p>
        <p class="upload-hint">{{ uploadHint }}</p>
      </div>
      
      <!-- 隐藏的文件输入 -->
      <input
        ref="fileInput"
        type="file"
        multiple
        accept="image/*"
        @change="handleFileSelect"
        style="display: none"
      />
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { IconUpload, IconX, IconCopy, IconCode, IconAlertCircle } from '@tabler/icons-vue';
import { useI18n } from 'vue-i18n';
import webdavUploadService from '@/utils/webdavUpload.js';
import { TICKET_CONFIG } from '@/utils/baseConfig.js';

const { t } = useI18n();

const props = defineProps({
  images: {
    type: Array,
    default: () => []
  },
  maxFiles: {
    type: Number,
    default: null
  },
  maxSize: {
    type: Number,
    default: null
  },
  disabled: {
    type: Boolean,
    default: false
  },
  enableMarkdown: {
    type: Boolean,
    default: true
  },
  autoInsertMarkdown: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:images', 'upload-success', 'upload-error', 'markdown-ready']);

const fileInput = ref(null);
const isDragOver = ref(false);
const error = ref('');

// 使用computed来处理v-model
const images = computed(() => props.images || []);

// 获取配置
const config = computed(() => TICKET_CONFIG.imageUpload);
const actualMaxFiles = computed(() => props.maxFiles || config.value.maxFiles);
const actualMaxSize = computed(() => props.maxSize || config.value.maxSize);
const isConfigValid = computed(() => webdavUploadService.isConfigValid());

const uploadText = computed(() => {
  if (!isConfigValid.value) {
    return t('imageUpload.configInvalid');
  }
  if (images.value.length > 0) {
    return t('imageUpload.addMoreImages');
  }
  return t('imageUpload.dragDropOrClick');
});

const uploadHint = computed(() => {
  const baseHint = t('imageUpload.supportedFormats', { maxSize: formatFileSize(actualMaxSize.value) });
  return `${baseHint} • ${t('imageUpload.pasteImage')}`;
});

// 触发文件选择
const triggerFileInput = () => {
  if (props.disabled || !isConfigValid.value) return;
  fileInput.value?.click();
};

// 处理文件选择
const handleFileSelect = (event) => {
  const files = Array.from(event.target.files);
  processFiles(files);
  event.target.value = '';
};

// 处理拖拽
const handleDragOver = (event) => {
  if (props.disabled || !isConfigValid.value) return;
  isDragOver.value = true;
};

const handleDragLeave = (event) => {
  isDragOver.value = false;
};

const handleDrop = (event) => {
  if (props.disabled || !isConfigValid.value) return;
  isDragOver.value = false;
  const files = Array.from(event.dataTransfer.files);
  processFiles(files);
};

// 处理粘贴事件
const handlePaste = (event) => {
  if (props.disabled || !isConfigValid.value) return;
  
  const items = event.clipboardData?.items;
  if (!items) return;
  
  const imageFiles = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile();
      if (file) {
        imageFiles.push(file);
      }
    }
  }
  
  if (imageFiles.length > 0) {
    event.preventDefault();
    processFiles(imageFiles);
  }
};

// 监听全局粘贴事件
const handleGlobalPaste = (event) => {
  // 检查是否在图片上传组件内
  const target = event.target;
  const isInUploadArea = target.closest('.image-upload-container');
  
  if (isInUploadArea) {
    handlePaste(event);
  }
};

// 处理文件
const processFiles = async (files) => {
  error.value = '';
  
  if (images.value.length + files.length > actualMaxFiles.value) {
    error.value = t('imageUpload.tooManyFiles', { max: actualMaxFiles.value });
    return;
  }

  for (const file of files) {
    if (!file.type.startsWith('image/')) {
      error.value = t('imageUpload.invalidFileType');
      continue;
    }

    if (file.size > actualMaxSize.value) {
      error.value = t('imageUpload.fileTooLarge', { maxSize: formatFileSize(actualMaxSize.value) });
      continue;
    }

    await addImage(file);
  }
};

// 添加图片
const addImage = async (file) => {
  const imageIndex = images.value.length;
  const imageData = {
    file,
    url: URL.createObjectURL(file),
    uploading: true,
    progress: 0,
    id: Date.now() + imageIndex,
    markdown: null
  };

  const newImages = [...images.value, imageData];
  emit('update:images', newImages);

  try {
    // 创建进度回调函数
    const onProgress = (progress) => {
      imageData.progress = progress;
      // 强制更新视图
      const updatedImages = [...images.value];
      emit('update:images', updatedImages);
      // console.log('ImageUpload progress:', progress + '%');
    };


    const result = await webdavUploadService.uploadImage(imageData.file, onProgress);
    
    imageData.progress = 100;
    imageData.uploadedUrl = result.url;
    imageData.uploading = false;
    const finalImages = [...images.value];
    emit('update:images', finalImages);
    
    if (props.enableMarkdown && result.markdown) {
      imageData.markdown = result.markdown;
      
      if (props.autoInsertMarkdown) {
        emit('markdown-ready', result.markdown);
      }
    }
    
    emit('upload-success', {
      id: imageData.id,
      url: result.url,
      file: imageData.file,
      markdown: result.markdown
    });
    
  } catch (err) {
    console.error('Upload failed:', err);
    error.value = err.message || t('imageUpload.uploadFailed');
    removeImage(imageIndex);
  }
};

// 移除图片
const removeImage = (index) => {
  const image = images.value[index];
  if (image.url && image.url.startsWith('blob:')) {
    URL.revokeObjectURL(image.url);
  }
  const newImages = [...images.value];
  newImages.splice(index, 1);
  emit('update:images', newImages);
};

// 复制 Markdown
const copyMarkdown = async (markdown) => {
  try {
    await navigator.clipboard.writeText(markdown);

  } catch (error) {

  }
};

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

onMounted(() => {
  // 添加全局粘贴事件监听
  document.addEventListener('paste', handleGlobalPaste);
});

onUnmounted(() => {
  // 移除全局粘贴事件监听
  document.removeEventListener('paste', handleGlobalPaste);
  
  // 清理blob URLs
  images.value.forEach(image => {
    if (image.url && image.url.startsWith('blob:')) {
      URL.revokeObjectURL(image.url);
    }
  });
});
</script>

<style scoped>
.image-upload-container {
  width: 100%;
}

.config-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 6px;
  margin-bottom: 12px;
  color: #856404;
  font-size: 12px;
}

.image-preview-area {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
  max-width: 100%;
  min-height: 100px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  border: 1px dashed rgba(0, 0, 0, 0.1);
}

.image-preview-item {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-color, #d1d5db);
  flex-shrink: 0;
  z-index: 1;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-preview-item:hover .image-overlay {
  opacity: 1;
}

.remove-btn,
.copy-markdown-btn {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.remove-btn {
  color: #dc3545;
}

.remove-btn:hover {
  background: #dc3545;
  color: white;
}

.copy-markdown-btn {
  color: #007bff;
}

.copy-markdown-btn:hover {
  background: #007bff;
  color: white;
}

.upload-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.98);
  padding: 8px;
  z-index: 1000;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border-radius: 0 0 8px 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
  position: relative;
  margin-bottom: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007bff, #0056b3);
  transition: width 0.3s ease;
  border-radius: 3px;
  position: relative;
  box-shadow: 0 0 6px rgba(0, 123, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.progress-text {
  font-size: 12px;
  color: white;
  text-align: center;
  display: block;
  font-weight: 700;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
  line-height: 1.2;
  letter-spacing: 0.5px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .image-preview-area {
    gap: 8px;
    min-height: 80px;
  }
  
  .image-preview-item {
    width: 70px;
    height: 70px;
  }
  
  .upload-progress {
    padding: 6px;
  }
  
  .progress-text {
    font-size: 11px;
  }
  
  .progress-bar {
    height: 5px;
    margin-bottom: 5px;
  }
}

@media (max-width: 480px) {
  .image-preview-area {
    gap: 6px;
    min-height: 70px;
  }
  
  .image-preview-item {
    width: 60px;
    height: 60px;
  }
  
  .upload-progress {
    padding: 4px;
  }
  
  .progress-text {
    font-size: 10px;
  }
  
  .progress-bar {
    height: 4px;
    margin-bottom: 4px;
  }
}

.markdown-indicator {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0, 123, 255, 0.9);
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
}

.upload-area {
  border: 2px dashed var(--border-color, #d1d5db);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--card-background, #ffffff);
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 12px;
}

.upload-area:hover:not(.disabled) {
  border-color: var(--theme-color, #3b82f6);
  background: rgba(59, 130, 246, 0.02);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
}

.upload-area.drag-over {
  border-color: var(--theme-color, #3b82f6);
  background: rgba(59, 130, 246, 0.05);
  transform: scale(1.01);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.upload-area.has-images {
  border-style: solid;
  border-width: 1px;
  padding: 12px;
  min-height: 80px;
  align-items: flex-start;
  transform: scale(0.9);
  transition: all 0.3s ease;
  margin-top: 8px;
  opacity: 0.9;
  background: rgba(0, 0, 0, 0.02);
}

.upload-area.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: var(--bg-secondary, #f9fafb);
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.upload-icon {
  color: var(--text-muted, #6b7280);
  opacity: 0.8;
  width: 32px;
  height: 32px;
  margin-bottom: 4px;
}

.upload-text {
  font-size: 14px;
  color: var(--text-color, #374151);
  margin: 0;
  font-weight: 500;
  line-height: 1.4;
}

.upload-hint {
  font-size: 12px;
  color: var(--text-muted, #6b7280);
  margin: 0;
  opacity: 0.8;
  line-height: 1.3;
  max-width: 200px;
  text-align: center;
}

.error-message {
  color: #dc3545;
  font-size: 12px;
  margin-top: 8px;
  text-align: center;
}

@media (max-width: 768px) {
  .image-preview-area {
    grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
    gap: 8px;
  }
  
  .image-preview-item {
    width: 70px;
    height: 70px;
  }
  
  .upload-area {
    padding: 16px;
    min-height: 100px;
  }
  
  .upload-text {
    font-size: 13px;
  }
  
  .upload-hint {
    font-size: 11px;
  }
  
  .upload-hint {
    font-size: 11px;
  }
}
</style>
