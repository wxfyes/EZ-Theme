<template>
  <div class="image-upload-container">
    <!-- 配置状态提示 -->
    <div v-if="!isConfigValid" class="config-warning">
      <IconAlertCircle :size="16" />
      <span>{{ $t('imageUpload.configInvalid') }}</span>
    </div>

    <!-- 图片预览区域 -->
    <div class="image-preview-area" v-if="images.length > 0">
      <div 
        v-for="(image, index) in images" 
        :key="index"
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
        <div class="upload-progress" v-if="image.uploading">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: image.progress + '%' }"></div>
          </div>
          <span class="progress-text">{{ image.progress }}%</span>
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
const images = ref([]);
const isDragOver = ref(false);
const error = ref('');

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
  return t('imageUpload.supportedFormats', { maxSize: formatFileSize(actualMaxSize.value) });
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

  images.value.push(imageData);
  emit('update:images', images.value);

  try {
    const result = await webdavUploadService.uploadImage(imageData.file);
    
    imageData.progress = 100;
    imageData.uploadedUrl = result.url;
    imageData.uploading = false;
    
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
  images.value.splice(index, 1);
  emit('update:images', images.value);
};

// 复制 Markdown
const copyMarkdown = async (markdown) => {
  try {
    await navigator.clipboard.writeText(markdown);
    console.log('Markdown copied to clipboard');
  } catch (error) {
    console.error('Failed to copy markdown:', error);
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

onUnmounted(() => {
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
  gap: 8px;
  margin-bottom: 12px;
}

.image-preview-item {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-color);
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
  background: rgba(0, 0, 0, 0.7);
  padding: 4px;
}

.progress-bar {
  width: 100%;
  height: 2px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 1px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--theme-color);
  transition: width 0.3s;
}

.progress-text {
  font-size: 10px;
  color: white;
  text-align: center;
  display: block;
  margin-top: 2px;
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
  border: 2px dashed var(--border-color);
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: var(--card-background);
}

.upload-area:hover:not(.disabled) {
  border-color: var(--theme-color);
  background: rgba(var(--theme-color-rgb), 0.05);
}

.upload-area.drag-over {
  border-color: var(--theme-color);
  background: rgba(var(--theme-color-rgb), 0.1);
  transform: scale(1.02);
}

.upload-area.has-images {
  border-style: solid;
  border-width: 1px;
  padding: 16px;
}

.upload-area.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.upload-icon {
  color: var(--text-secondary);
}

.upload-text {
  font-weight: 500;
  color: var(--text-primary);
  margin: 0;
}

.upload-hint {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0;
}

.error-message {
  color: #dc3545;
  font-size: 12px;
  margin-top: 8px;
  text-align: center;
}

@media (max-width: 768px) {
  .image-preview-item {
    width: 60px;
    height: 60px;
  }
  
  .upload-area {
    padding: 16px;
  }
  
  .upload-text {
    font-size: 14px;
  }
  
  .upload-hint {
    font-size: 11px;
  }
}
</style>
