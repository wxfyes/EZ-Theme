<template>
  <div class="knowledges-container">
    <el-card class="action-card" shadow="hover">
      <div class="flex-between align-center">
        <span class="action-text">知识库管理</span>
        <div class="flex-center gap-10">
          <el-button type="warning" icon="Sort" :loading="sortLoading" @click="handleSaveSort">
            保存排序
          </el-button>
          <el-button type="primary" icon="Plus" @click="openCreateDialog">添加文章</el-button>
        </div>
      </div>
    </el-card>

    <el-card class="table-card mt-20" shadow="hover">
      <el-table :data="knowledges" v-loading="loading" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="70" align="center" />
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="category" label="分类" width="120" align="center">
          <template #default="scope">
            <el-tag type="info" size="small">{{ scope.row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="show" label="显示状态" width="100" align="center">
          <template #default="scope">
            <el-switch
              v-model="scope.row.show"
              :active-value="1"
              :inactive-value="0"
              @change="handleToggleShow(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="最后更新" width="180">
          <template #default="scope">
            <span>{{ formatTime(scope.row.updated_at) }}</span>
          </template>
        </el-table-column>
        
        <!-- Sorting Column -->
        <el-table-column label="排序调整" width="150" align="center">
          <template #default="scope">
            <el-button-group>
              <el-button 
                type="info" 
                size="small" 
                icon="CaretTop" 
                :disabled="scope.$index === 0" 
                @click="moveRow(scope.$index, -1)"
              />
              <el-button 
                type="info" 
                size="small" 
                icon="CaretBottom" 
                :disabled="scope.$index === knowledges.length - 1" 
                @click="moveRow(scope.$index, 1)"
              />
            </el-button-group>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" align="right">
          <template #default="scope">
            <el-button type="primary" link @click="openEditDialog(scope.row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Dialog -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="750px" top="8vh">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="文章标题" prop="title">
          <el-input v-model="form.title" placeholder="如：如何在 Windows 上配置客户端" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="文章分类" prop="category">
              <el-select
                v-model="form.category"
                filterable
                allow-create
                default-first-option
                placeholder="选择分类或手动输入"
                style="width: 100%"
              >
                <el-option v-for="cat in categories" :key="cat" :label="cat" :value="cat" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="文章语言" prop="language">
              <el-select v-model="form.language" style="width: 100%">
                <el-option label="简体中文" value="zh-CN" />
                <el-option label="繁体中文" value="zh-TW" />
                <el-option label="English" value="en-US" />
                <el-option label="日本語" value="ja-JP" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="文章内容" prop="body">
          <el-input
            type="textarea"
            :rows="15"
            v-model="form.body"
            placeholder="支持 Markdown 语法内容..."
            class="code-textarea"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { getSecurePath } from '../api';
import api from '../api';
import { ElMessage, ElMessageBox } from 'element-plus';

const loading = ref(false);
const sortLoading = ref(false);
const submitLoading = ref(false);
const dialogVisible = ref(false);
const dialogTitle = ref('添加文章');
const isEdit = ref(false);

const knowledges = ref([]);
const categories = ref([]);
const formRef = ref(null);
const form = reactive({
  id: null,
  title: '',
  category: '',
  language: 'zh-CN',
  body: ''
});

const rules = {
  title: [{ required: true, message: '请输入文章标题', trigger: 'blur' }],
  category: [{ required: true, message: '分类不能为空', trigger: 'change' }],
  language: [{ required: true, message: '请选择文章语言', trigger: 'change' }],
  body: [{ required: true, message: '文章内容不能为空', trigger: 'blur' }]
};

const formatTime = (ts) => {
  if (!ts) return '-';
  return new Date(ts * 1000).toLocaleString();
};

const fetchCategories = async () => {
  try {
    const securePath = getSecurePath();
    const res = await api.get(`/${securePath}/knowledge/getCategory`);
    if (res.data) {
      categories.value = res.data;
    }
  } catch (err) {
    console.error(err);
  }
};

const fetchKnowledges = async () => {
  loading.value = true;
  try {
    const securePath = getSecurePath();
    const res = await api.get(`/${securePath}/knowledge/fetch`);
    if (res.data) {
      knowledges.value = res.data;
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const moveRow = (idx, direction) => {
  const targetIdx = idx + direction;
  if (targetIdx < 0 || targetIdx >= knowledges.value.length) return;
  const temp = knowledges.value[idx];
  knowledges.value[idx] = knowledges.value[targetIdx];
  knowledges.value[targetIdx] = temp;
};

const handleSaveSort = async () => {
  sortLoading.value = true;
  try {
    const securePath = getSecurePath();
    const ids = knowledges.value.map(x => x.id);
    await api.post(`/${securePath}/knowledge/sort`, { knowledge_ids: ids });
    ElMessage.success('排序保存成功');
    fetchKnowledges();
  } catch (err) {
    ElMessage.error(err.message || '排序保存失败');
  } finally {
    sortLoading.value = false;
  }
};

const openCreateDialog = () => {
  isEdit.value = false;
  dialogTitle.value = '添加文章';
  form.id = null;
  form.title = '';
  form.category = categories.value.length > 0 ? categories.value[0] : '';
  form.language = 'zh-CN';
  form.body = '';
  dialogVisible.value = true;
};

const openEditDialog = async (row) => {
  isEdit.value = true;
  dialogTitle.value = '编辑文章';
  form.id = row.id;
  
  // Fetch detailed body
  try {
    const securePath = getSecurePath();
    const res = await api.get(`/${securePath}/knowledge/fetch`, { params: { id: row.id } });
    if (res.data) {
      form.title = res.data.title;
      form.category = res.data.category;
      form.language = res.data.language || 'zh-CN';
      form.body = res.data.body || '';
      dialogVisible.value = true;
    }
  } catch (err) {
    ElMessage.error('获取文章详情失败');
  }
};

const handleToggleShow = async (row) => {
  try {
    const securePath = getSecurePath();
    await api.post(`/${securePath}/knowledge/show`, { id: row.id });
    ElMessage.success('启用状态更新成功');
  } catch (err) {
    console.error(err);
    row.show = row.show ? 0 : 1;
  }
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    submitLoading.value = true;
    try {
      const securePath = getSecurePath();
      const payload = {
        title: form.title,
        category: form.category,
        language: form.language,
        body: form.body
      };
      if (isEdit.value) {
        payload.id = form.id;
      }
      await api.post(`/${securePath}/knowledge/save`, payload);
      ElMessage.success(isEdit.value ? '编辑文章成功' : '添加文章成功');
      dialogVisible.value = false;
      fetchKnowledges();
      fetchCategories();
    } catch (err) {
      ElMessage.error(err.message || '保存失败');
    } finally {
      submitLoading.value = false;
    }
  });
};

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该文章吗？', '提示', {
    type: 'warning',
    confirmButtonText: '确定删除',
    cancelButtonText: '取消'
  }).then(async () => {
    try {
      const securePath = getSecurePath();
      await api.post(`/${securePath}/knowledge/drop`, { id: row.id });
      ElMessage.success('删除文章成功');
      fetchKnowledges();
    } catch (err) {
      ElMessage.error(err.message || '删除失败');
    }
  }).catch(() => {});
};

onMounted(() => {
  fetchCategories();
  fetchKnowledges();
});
</script>

<style scoped>
.action-card {
  border-radius: 16px;
  border: 1px solid var(--el-border-color-light);
}
.action-text {
  font-size: 15px;
  font-weight: 600;
}
.table-card {
  border-radius: 16px;
  border: 1px solid var(--el-border-color-light);
}
.mt-20 {
  margin-top: 20px;
}
.gap-10 {
  gap: 10px;
}
.code-textarea :deep(.el-textarea__inner) {
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
}
</style>
