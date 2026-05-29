<template>
  <div class="tickets-container">
    <el-card class="filter-card" shadow="hover">
      <div class="flex-between flex-wrap gap-10">
        <div class="filter-left flex-center flex-wrap gap-10">
          <el-input
            v-model="searchEmail"
            placeholder="搜索用户邮箱..."
            prefix-icon="Search"
            clearable
            style="width: 240px"
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          />
          <el-select v-model="filterStatus" placeholder="工单状态" clearable style="width: 140px" @change="handleSearch">
            <el-option label="全部状态" value="" />
            <el-option label="开启中" :value="0" />
            <el-option label="已关闭" :value="1" />
          </el-select>
          <el-select v-model="filterReply" placeholder="回复状态" clearable style="width: 140px" @change="handleSearch">
            <el-option label="全部回复" value="" />
            <el-option label="待回复" :value="0" />
            <el-option label="已回复" :value="1" />
          </el-select>
          <el-button type="primary" @click="handleSearch">筛选</el-button>
        </div>
      </div>
    </el-card>

    <el-card class="table-card mt-20" shadow="hover">
      <el-table :data="tickets" v-loading="loading" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="70" align="center" />
        <el-table-column prop="subject" label="主题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="user_id" label="用户 ID" width="100" align="center" />
        
        <el-table-column prop="level" label="等级" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getLevelTagType(scope.row.level)" size="small">
              {{ levelMap[scope.row.level] || '普通' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 0 ? 'success' : 'info'" size="small" effect="dark">
              {{ scope.row.status === 0 ? '开启中' : '已关闭' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="reply_status" label="回复状态" width="120" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.reply_status === 0 ? 'warning' : 'success'" size="small">
              {{ scope.row.reply_status === 0 ? '待回复' : '已回复' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="更新时间" width="180">
          <template #default="scope">
            <span>{{ formatTime(scope.row.updated_at) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" align="right">
          <template #default="scope">
            <el-button type="primary" link @click="openTicketChat(scope.row)">回复沟通</el-button>
            <el-button 
              v-if="scope.row.status === 0" 
              type="danger" 
              link 
              @click="handleCloseTicket(scope.row)"
            >
              关闭
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination flex-between mt-20">
        <span class="pagination-info">共 {{ total }} 条记录</span>
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          layout="sizes, prev, pager, next"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- Chat Drawer -->
    <el-drawer
      v-model="chatVisible"
      title="工单沟通详情"
      size="600px"
      destroy-on-close
    >
      <template #header>
        <div class="drawer-header-info">
          <span style="font-size: 16px; font-weight: 600;">工单 #{{ activeTicket.id }} - {{ activeTicket.subject }}</span>
          <div class="mt-5 text-secondary">
            <span>用户 ID: <code>{{ activeTicket.user_id }}</code></span>
            <span class="ml-15" v-if="userEmail">邮箱: <code>{{ userEmail }}</code></span>
          </div>
        </div>
      </template>

      <div class="chat-container">
        <!-- Message History -->
        <el-scrollbar class="chat-history-scroll" ref="chatScrollRef">
          <div class="chat-history-list" style="padding: 10px;">
            <div 
              v-for="msg in chatMessages" 
              :key="msg.id" 
              :class="['chat-bubble-row', msg.is_me ? 'admin-row' : 'user-row']"
            >
              <div class="chat-bubble">
                <div class="bubble-header">
                  <span class="sender-name">{{ msg.is_me ? '管理员' : '用户' }}</span>
                  <span class="message-time ml-10">{{ formatTime(msg.created_at) }}</span>
                </div>
                <div class="bubble-body">
                  {{ msg.message }}
                </div>
              </div>
            </div>
          </div>
        </el-scrollbar>

        <!-- Input Box -->
        <div class="chat-input-box" v-if="activeTicket.status === 0">
          <el-input
            type="textarea"
            :rows="3"
            v-model="replyText"
            placeholder="请输入回复内容..."
            @keyup.ctrl.enter="handleReply"
          />
          <div class="flex-between align-center mt-10">
            <span class="font-11 text-secondary">Ctrl + Enter 快捷发送</span>
            <div>
              <el-button type="danger" plain @click="handleCloseTicket(activeTicket)">关闭工单</el-button>
              <el-button type="primary" :loading="replyLoading" @click="handleReply">发送回复</el-button>
            </div>
          </div>
        </div>
        <div class="chat-closed-box" v-else>
          <el-alert title="该工单已关闭" type="info" show-icon :closable="false" />
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue';
import { getSecurePath } from '../api';
import api from '../api';
import { ElMessage, ElMessageBox } from 'element-plus';

const loading = ref(false);
const tickets = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

const searchEmail = ref('');
const filterStatus = ref('');
const filterReply = ref('');

const levelMap = {
  0: '低',
  1: '中',
  2: '高'
};

const getLevelTagType = (lvl) => {
  if (lvl === 2) return 'danger';
  if (lvl === 1) return 'warning';
  return 'info';
};

const formatTime = (ts) => {
  if (!ts) return '-';
  return new Date(ts * 1000).toLocaleString();
};

const fetchTickets = async () => {
  loading.value = true;
  try {
    const securePath = getSecurePath();
    const params = {
      current: currentPage.value,
      pageSize: pageSize.value
    };
    if (filterStatus.value !== '') params.status = filterStatus.value;
    if (filterReply.value !== '') params.reply_status = [filterReply.value];
    if (searchEmail.value) params.email = searchEmail.value;

    const res = await api.get(`/${securePath}/ticket/fetch`, { params });
    if (res.data) {
      tickets.value = res.data;
      total.value = res.total;
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchTickets();
};

const handleSizeChange = (val) => {
  pageSize.value = val;
  fetchTickets();
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  fetchTickets();
};

// Chat Drawer Logic
const chatVisible = ref(false);
const activeTicket = ref({});
const chatMessages = ref([]);
const userEmail = ref('');
const replyText = ref('');
const replyLoading = ref(false);
const chatScrollRef = ref(null);

const openTicketChat = async (row) => {
  activeTicket.value = row;
  chatMessages.value = [];
  userEmail.value = '';
  replyText.value = '';
  chatVisible.value = true;
  
  // Fetch details and history
  try {
    const securePath = getSecurePath();
    const res = await api.get(`/${securePath}/ticket/fetch`, { params: { id: row.id } });
    if (res.data) {
      activeTicket.value = res.data;
      chatMessages.value = res.data.message || [];
      scrollToBottom();
    }
    
    // Asynchronously get user email
    const userRes = await api.get(`/${securePath}/user/getUserInfoById`, { params: { id: row.user_id } });
    if (userRes.data) {
      userEmail.value = userRes.data.email;
    }
  } catch (err) {
    console.error(err);
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    if (chatScrollRef.value) {
      chatScrollRef.value.setScrollTop(999999);
    }
  });
};

const handleReply = async () => {
  if (!replyText.value.trim()) return;
  replyLoading.value = true;
  try {
    const securePath = getSecurePath();
    await api.post(`/${securePath}/ticket/reply`, {
      id: activeTicket.value.id,
      message: replyText.value.trim()
    });
    ElMessage.success('发送回复成功');
    replyText.value = '';
    // Reload messages
    const res = await api.get(`/${securePath}/ticket/fetch`, { params: { id: activeTicket.value.id } });
    if (res.data) {
      chatMessages.value = res.data.message || [];
      scrollToBottom();
    }
    fetchTickets();
  } catch (err) {
    ElMessage.error(err.message || '回复失败');
  } finally {
    replyLoading.value = false;
  }
};

const handleCloseTicket = (row) => {
  ElMessageBox.confirm('确定要关闭该工单吗？关闭后用户将无法再追问，除非您或他重新开启。', '提示', {
    type: 'warning',
    confirmButtonText: '确定关闭',
    cancelButtonText: '取消'
  }).then(async () => {
    try {
      const securePath = getSecurePath();
      await api.post(`/${securePath}/ticket/close`, { id: row.id });
      ElMessage.success('工单已关闭');
      if (chatVisible.value && activeTicket.value.id === row.id) {
        activeTicket.value.status = 1;
      }
      fetchTickets();
    } catch (err) {
      ElMessage.error(err.message || '关闭失败');
    }
  }).catch(() => {});
};

onMounted(() => {
  fetchTickets();
});
</script>

<style scoped>
.filter-card {
  border-radius: 16px;
  border: 1px solid var(--el-border-color-light);
}
.table-card {
  border-radius: 16px;
  border: 1px solid var(--el-border-color-light);
}
.text-secondary {
  color: var(--el-text-color-secondary);
}
.ml-15 {
  margin-left: 15px;
}
.mt-20 {
  margin-top: 20px;
}
.mt-5 {
  margin-top: 5px;
}
.mt-10 {
  margin-top: 10px;
}
.ml-10 {
  margin-left: 10px;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
}
.chat-history-scroll {
  flex: 1;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  background-color: var(--el-fill-color-blank);
}
.chat-history-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.chat-bubble-row {
  display: flex;
  width: 100%;
}
.user-row {
  justify-content: flex-start;
}
.admin-row {
  justify-content: flex-end;
}
.chat-bubble {
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.5;
}
.user-row .chat-bubble {
  background-color: var(--el-fill-color-light);
  color: var(--el-text-color-primary);
  border-top-left-radius: 2px;
}
.admin-row .chat-bubble {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  border-top-right-radius: 2px;
  border: 1px solid var(--el-color-primary-light-7);
}
.bubble-header {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  margin-bottom: 5px;
  display: flex;
  justify-content: space-between;
}
.bubble-body {
  white-space: pre-wrap;
  word-break: break-all;
}

.chat-input-box {
  padding-top: 15px;
}
.chat-closed-box {
  padding-top: 15px;
}
.pagination-info {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
</style>
