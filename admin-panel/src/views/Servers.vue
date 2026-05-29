<template>
  <div class="servers-container">
    <!-- Action Bar -->
    <el-card class="action-card" shadow="hover">
      <div class="flex-between flex-wrap gap-10">
        <span class="action-text">节点管理</span>
        <div class="flex-center gap-10">
          <el-dropdown trigger="click" @command="handleCreateCommand">
            <el-button type="primary" icon="Plus">
              添加节点<el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-for="(label, type) in nodeTypes" :key="type" :command="type">
                  {{ label }} 节点
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </el-card>

    <!-- Tabs by node type -->
    <el-tabs v-model="activeTab" class="mt-20 node-tabs" @tab-change="handleTabChange">
      <el-tab-pane v-for="(label, type) in nodeTypes" :key="type" :label="label" :name="type">
        <el-card class="table-card" shadow="hover">
          <el-table :data="nodeLists[type] || []" v-loading="loading" stripe style="width: 100%">
            <el-table-column prop="id" label="ID" width="70" align="center" />
            <el-table-column prop="name" label="节点名称" min-width="150" />
            
            <el-table-column prop="host" label="地址:端口" min-width="180" show-overflow-tooltip>
              <template #default="scope">
                <code>{{ scope.row.host }}:{{ scope.row.port }}</code>
              </template>
            </el-table-column>

            <el-table-column prop="rate" label="流量倍率" width="100" align="center">
              <template #default="scope">
                <el-tag :type="scope.row.rate > 1 ? 'warning' : 'success'" size="small" effect="dark">
                  {{ scope.row.rate }}x
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column prop="group_id" label="分配组" min-width="150">
              <template #default="scope">
                <el-tag v-for="gId in scope.row.group_id" :key="gId" size="small" class="mr-5">
                  {{ getGroupName(gId) }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column prop="show" label="状态" width="100" align="center">
              <template #default="scope">
                <el-switch
                  v-model="scope.row.show"
                  :active-value="1"
                  :inactive-value="0"
                  @change="(val) => handleToggleShow(scope.row, type, val)"
                />
              </template>
            </el-table-column>

            <el-table-column label="操作" width="220" align="right">
              <template #default="scope">
                <el-button type="primary" link @click="openEditDialog(scope.row, type)">编辑</el-button>
                <el-button type="success" link @click="handleCopy(scope.row, type)">复制</el-button>
                <el-button type="danger" link @click="handleDelete(scope.row, type)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- Node Form Dialog -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px" top="8vh">
      <el-scrollbar max-height="65vh">
        <el-form :model="form" :rules="rules" ref="formRef" label-width="120px" style="padding-right: 15px;">
          <!-- 基础设置 -->
          <div class="section-title">基础配置</div>
          <el-form-item label="节点名称" prop="name">
            <el-input v-model="form.name" placeholder="请输入节点名称，如 香港 01 [BGP]" />
          </el-form-item>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="流量倍率" prop="rate">
                <el-input-number v-model="form.rate" :min="0" :precision="2" :step="0.1" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="分配权限组" prop="group_id">
                <el-select v-model="form.group_id" multiple collapse-tags placeholder="请选择权限组" style="width: 100%">
                  <el-option v-for="g in groupList" :key="g.id" :label="g.name" :value="g.id" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="节点地址" prop="host">
            <el-input v-model="form.host" placeholder="例如 hk1.node.com 或 12.34.56.78" />
          </el-form-item>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="连接端口" prop="port">
                <el-input-number v-model="form.port" :min="1" :max="65535" :controls="false" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="服务端口" prop="server_port">
                <el-input-number v-model="form.server_port" :min="1" :max="65535" :controls="false" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="父节点" prop="parent_id">
                <el-select v-model="form.parent_id" placeholder="无单播中转（无父节点）" clearable style="width: 100%">
                  <el-option label="无" :value="0" />
                  <el-option 
                    v-for="s in sameTypeServers" 
                    :key="s.id" 
                    :label="s.name" 
                    :value="s.id" 
                    :disabled="s.id === form.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="路由组" prop="route_id">
                <el-select v-model="form.route_id" multiple collapse-tags placeholder="选择分流路由组" style="width: 100%">
                  <el-option v-for="r in routeList" :key="r.id" :label="r.remarks" :value="r.id" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="标签设置" prop="tags">
            <el-select v-model="form.tags" multiple filterable allow-create default-first-option placeholder="请输入标签并回车" style="width: 100%">
              <el-option v-for="t in tagOptions" :key="t" :label="t" :value="t" />
            </el-select>
          </el-form-item>

          <!-- 协议特定设置 -->
          <div class="section-title mt-20">协议配置 ({{ nodeTypes[activeType] }})</div>

          <!-- Shadowsocks Options -->
          <template v-if="activeType === 'shadowsocks'">
            <el-form-item label="加密方式" prop="cipher">
              <el-select v-model="form.cipher" style="width: 100%">
                <el-option label="aes-256-gcm" value="aes-256-gcm" />
                <el-option label="aes-128-gcm" value="aes-128-gcm" />
                <el-option label="chacha20-ietf-poly1305" value="chacha20-ietf-poly1305" />
                <el-option label="2022-blake3-aes-128-gcm" value="2022-blake3-aes-128-gcm" />
                <el-option label="2022-blake3-aes-256-gcm" value="2022-blake3-aes-256-gcm" />
              </el-select>
            </el-form-item>
            <el-form-item label="混淆协议" prop="obfs">
              <el-select v-model="form.obfs" placeholder="不启用混淆" clearable style="width: 100%">
                <el-option label="无混淆" :value="null" />
                <el-option label="HTTP 混淆" value="http" />
              </el-select>
            </el-form-item>
            <template v-if="form.obfs === 'http'">
              <el-form-item label="混淆 Host" prop="obfs_settings_host">
                <el-input v-model="form.obfs_settings_host" placeholder="例如: static.xx.com" />
              </el-form-item>
              <el-form-item label="混淆 Path" prop="obfs_settings_path">
                <el-input v-model="form.obfs_settings_path" placeholder="例如: /index.html" />
              </el-form-item>
            </template>
          </template>

          <!-- VMess Options -->
          <template v-if="activeType === 'vmess'">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="传输协议" prop="network">
                  <el-select v-model="form.network" style="width: 100%">
                    <el-option label="TCP" value="tcp" />
                    <el-option label="WebSocket (WS)" value="ws" />
                    <el-option label="gRPC" value="grpc" />
                    <el-option label="Hysteria" value="kcp" />
                    <el-option label="QUIC" value="quic" />
                    <el-option label="HTTPUpgrade" value="httpupgrade" />
                    <el-option label="xhttp" value="xhttp" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="TLS 加密" prop="tls">
                  <el-switch v-model="form.tls" :active-value="1" :inactive-value="0" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="Vmess安全配置" prop="vmess_security">
              <el-select v-model="form.vmess_security" style="width: 100%">
                <el-option label="Auto" value="auto" />
                <el-option label="AES-128-GCM" value="aes-128-gcm" />
                <el-option label="CHACHA20-POLY1305" value="chacha20-poly1305" />
                <el-option label="None" value="none" />
              </el-select>
            </el-form-item>

            <el-tabs type="border-card" class="mt-15 advanced-json-tabs">
              <el-tab-pane label="TLS 配置 (tlsSettings)">
                <el-input type="textarea" :rows="6" v-model="form.tlsSettings_str" placeholder="{}" class="code-textarea" />
              </el-tab-pane>
              <el-tab-pane label="传输配置 (networkSettings)">
                <el-input type="textarea" :rows="6" v-model="form.networkSettings_str" placeholder="{}" class="code-textarea" />
              </el-tab-pane>
              <el-tab-pane label="DNS 配置 (dnsSettings)">
                <el-input type="textarea" :rows="6" v-model="form.dnsSettings_str" placeholder="{}" class="code-textarea" />
              </el-tab-pane>
              <el-tab-pane label="规则配置 (ruleSettings)">
                <el-input type="textarea" :rows="6" v-model="form.ruleSettings_str" placeholder="{}" class="code-textarea" />
              </el-tab-pane>
            </el-tabs>
          </template>

          <!-- Vless Options -->
          <template v-if="activeType === 'vless'">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="安全性" prop="tls">
                  <el-select v-model="form.tls" style="width: 100%">
                    <el-option label="无安全性" :value="0" />
                    <el-option label="TLS" :value="1" />
                    <el-option label="Reality" :value="2" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="传输协议" prop="network">
                  <el-select v-model="form.network" style="width: 100%">
                    <el-option label="TCP" value="tcp" />
                    <el-option label="WebSocket (WS)" value="ws" />
                    <el-option label="gRPC" value="grpc" />
                    <el-option label="Hysteria" value="kcp" />
                    <el-option label="QUIC" value="quic" />
                    <el-option label="HTTPUpgrade" value="httpupgrade" />
                    <el-option label="xhttp" value="xhttp" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12" v-if="form.network === 'tcp'">
                <el-form-item label="XTLS流控算法" prop="flow">
                  <el-select v-model="form.flow" clearable placeholder="无流控" style="width: 100%">
                    <el-option label="无" :value="null" />
                    <el-option label="xtls-rprx-vision" value="xtls-rprx-vision" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="加密方式" prop="encryption">
                  <el-select v-model="form.encryption" style="width: 100%">
                    <el-option label="无加密 (none)" value="none" />
                    <el-option label="mlkem768x25519plus" value="mlkem768x25519plus" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-tabs type="border-card" class="mt-15 advanced-json-tabs">
              <el-tab-pane label="TLS 配置 (tls_settings)">
                <el-input type="textarea" :rows="6" v-model="form.tls_settings_str" placeholder="{}" class="code-textarea" />
              </el-tab-pane>
              <el-tab-pane label="传输配置 (network_settings)">
                <el-input type="textarea" :rows="6" v-model="form.network_settings_str" placeholder="{}" class="code-textarea" />
              </el-tab-pane>
              <el-tab-pane label="加密配置 (encryption_settings)">
                <el-input type="textarea" :rows="6" v-model="form.encryption_settings_str" placeholder="{}" class="code-textarea" />
              </el-tab-pane>
            </el-tabs>
          </template>

          <!-- Trojan Options -->
          <template v-if="activeType === 'trojan'">
            <el-form-item label="SNI/域名" prop="server_name">
              <el-input v-model="form.server_name" placeholder="请输入 SNI / Server Name" />
            </el-form-item>
            <el-form-item label="允许不安全证书" prop="allow_insecure">
              <el-switch v-model="form.allow_insecure" :active-value="1" :inactive-value="0" />
            </el-form-item>
          </template>

          <!-- Hysteria Options -->
          <template v-if="activeType === 'hysteria'">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Hysteria 版本" prop="version">
                  <el-select v-model="form.version" style="width: 100%">
                    <el-option label="Hysteria 1" :value="1" />
                    <el-option label="Hysteria 2" :value="2" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="允许不安全" prop="insecure">
                  <el-switch v-model="form.insecure" :active-value="1" :inactive-value="0" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="上行带宽 (Mbps)" prop="up_mbps">
                  <el-input-number v-model="form.up_mbps" :min="0" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="下行带宽 (Mbps)" prop="down_mbps">
                  <el-input-number v-model="form.down_mbps" :min="0" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="SNI / ServerName" prop="server_name">
              <el-input v-model="form.server_name" placeholder="节点证书 SNI" />
            </el-form-item>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="混淆协议 (obfs)" prop="obfs">
                  <el-input v-model="form.obfs" placeholder="如 salamander (留空关闭)" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="混淆密码" prop="obfs_password">
                  <el-input v-model="form.obfs_password" placeholder="留空则自动生成" />
                </el-form-item>
              </el-col>
            </el-row>
          </template>

          <!-- Tuic Options -->
          <template v-if="activeType === 'tuic'">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="SNI / ServerName" prop="server_name">
                  <el-input v-model="form.server_name" placeholder="请输入 SNI" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="允许不安全" prop="insecure">
                  <el-switch v-model="form.insecure" :active-value="1" :inactive-value="0" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="关闭 SNI" prop="disable_sni">
                  <el-switch v-model="form.disable_sni" :active-value="1" :inactive-value="0" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="0-RTT 握手" prop="zero_rtt_handshake">
                  <el-switch v-model="form.zero_rtt_handshake" :active-value="1" :inactive-value="0" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="UDP 转发模式" prop="udp_relay_mode">
                  <el-select v-model="form.udp_relay_mode" placeholder="默认 (native)" style="width: 100%">
                    <el-option label="native" value="native" />
                    <el-option label="quic" value="quic" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="拥塞控制" prop="congestion_control">
                  <el-select v-model="form.congestion_control" placeholder="默认 (bbr)" style="width: 100%">
                    <el-option label="bbr" value="bbr" />
                    <el-option label="cubic" value="cubic" />
                    <el-option label="new_reno" value="new_reno" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </template>

          <!-- AnyTLS Options -->
          <template v-if="activeType === 'anytls'">
            <el-form-item label="高级参数" prop="anytls_custom">
              <el-input type="textarea" :rows="6" v-model="form.anytls_custom_str" placeholder="{}" class="code-textarea" />
            </el-form-item>
          </template>

          <!-- V2node Options -->
          <template v-if="activeType === 'v2node'">
            <el-form-item label="高级参数" prop="v2node_custom">
              <el-input type="textarea" :rows="6" v-model="form.v2node_custom_str" placeholder="{}" class="code-textarea" />
            </el-form-item>
          </template>

          <el-form-item label="上架状态" class="mt-15">
            <el-radio-group v-model="form.show">
              <el-radio :label="1">启用显示</el-radio>
              <el-radio :label="0">下架隐藏</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </el-scrollbar>
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
import { ref, reactive, onMounted, computed } from 'vue';
import { getSecurePath } from '../api';
import api from '../api';
import { ElMessage, ElMessageBox } from 'element-plus';

const loading = ref(false);
const submitLoading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const dialogTitle = ref('添加节点');

const activeTab = ref('shadowsocks');
const activeType = ref('shadowsocks');

const nodeTypes = {
  shadowsocks: 'Shadowsocks',
  vmess: 'Vmess',
  trojan: 'Trojan',
  vless: 'Vless',
  hysteria: 'Hysteria',
  tuic: 'Tuic',
  anytls: 'AnyTLS',
  v2node: 'V2node'
};

const nodeLists = reactive({
  shadowsocks: [],
  vmess: [],
  trojan: [],
  vless: [],
  hysteria: [],
  tuic: [],
  anytls: [],
  v2node: [],
});

const groupList = ref([]);
const routeList = ref([]);
const tagOptions = ref(['香港', '日本', '新加坡', '美国', '台湾', '优化', 'BGP', 'IPLC', 'IEPL']);

const formRef = ref(null);
const form = reactive({
  id: null,
  name: '',
  rate: 1.0,
  group_id: [],
  host: '',
  port: 10000,
  server_port: 10000,
  parent_id: 0,
  route_id: [],
  tags: [],
  show: 1,
  
  // Shadowsocks specific
  cipher: 'aes-256-gcm',
  obfs: null,
  obfs_settings_host: '',
  obfs_settings_path: '',
  
  // Vmess specific
  network: 'tcp',
  tls: 0,
  vmess_security: 'none',
  tlsSettings_str: '{}',
  networkSettings_str: '{}',
  dnsSettings_str: '{}',
  ruleSettings_str: '{}',
  
  // Vless specific
  flow: null,
  encryption: 'none',
  tls_settings_str: '{}',
  network_settings_str: '{}',
  encryption_settings_str: '{}',
  
  // Trojan specific
  server_name: '',
  allow_insecure: 0,
  
  // Hysteria specific
  version: 2,
  up_mbps: 100,
  down_mbps: 100,
  obfs_password: '',
  insecure: 0,
  
  // Tuic specific
  disable_sni: 0,
  udp_relay_mode: 'native',
  zero_rtt_handshake: 1,
  congestion_control: 'bbr',

  // Custom configurations (for AnyTLS and V2node backup)
  anytls_custom_str: '{}',
  v2node_custom_str: '{}'
});

const rules = {
  name: [{ required: true, message: '请输入节点名称', trigger: 'blur' }],
  host: [{ required: true, message: '请输入节点地址', trigger: 'blur' }],
  port: [{ required: true, message: '请输入连接端口', trigger: 'blur' }],
  server_port: [{ required: true, message: '请输入服务端口', trigger: 'blur' }],
  group_id: [{ type: 'array', required: true, message: '请选择至少一个权限组', trigger: 'change' }],
};

const sameTypeServers = computed(() => {
  return (nodeLists[activeType.value] || []).filter(s => s.id !== form.id);
});

const getGroupName = (id) => {
  const g = groupList.value.find(item => item.id === id);
  return g ? g.name : `组 ${id}`;
};

const fetchGroups = async () => {
  try {
    const securePath = getSecurePath();
    const res = await api.get(`/${securePath}/server/group/fetch`);
    if (res.data) {
      groupList.value = res.data;
    }
  } catch (err) {
    console.error(err);
  }
};

const fetchRoutes = async () => {
  try {
    const securePath = getSecurePath();
    const res = await api.get(`/${securePath}/server/route/fetch`);
    if (res.data) {
      routeList.value = res.data;
    }
  } catch (err) {
    console.error(err);
  }
};

const fetchNodes = async () => {
  loading.value = true;
  try {
    const securePath = getSecurePath();
    const res = await api.get(`/${securePath}/server/manage/getNodes`);
    if (res.data) {
      Object.keys(nodeLists).forEach(k => {
        nodeLists[k] = [];
      });
      res.data.forEach(node => {
        const type = node.type || 'vmess';
        if (nodeLists[type] !== undefined) {
          nodeLists[type].push(node);
        }
      });
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const handleTabChange = (name) => {
  activeType.value = name;
};

const handleToggleShow = async (row, type, val) => {
  try {
    const securePath = getSecurePath();
    await api.post(`/${securePath}/server/${type}/update`, {
      id: row.id,
      show: val
    });
    ElMessage.success('状态更新成功');
  } catch (err) {
    console.error(err);
    row.show = val === 1 ? 0 : 1;
  }
};

const handleCreateCommand = (type) => {
  isEdit.value = false;
  activeType.value = type;
  dialogTitle.value = `添加 ${nodeTypes[type]} 节点`;
  
  // Reset form
  form.id = null;
  form.name = '';
  form.rate = 1.0;
  form.group_id = groupList.value.length > 0 ? [groupList.value[0].id] : [];
  form.host = '';
  form.port = 10000;
  form.server_port = 10000;
  form.parent_id = 0;
  form.route_id = [];
  form.tags = [];
  form.show = 1;
  
  form.cipher = 'aes-256-gcm';
  form.obfs = null;
  form.obfs_settings_host = '';
  form.obfs_settings_path = '';
  
  form.network = 'tcp';
  form.tls = 0;
  form.vmess_security = 'none';
  form.tlsSettings_str = '{}';
  form.networkSettings_str = '{}';
  form.dnsSettings_str = '{}';
  form.ruleSettings_str = '{}';
  
  form.flow = null;
  form.encryption = 'none';
  form.tls_settings_str = '{}';
  form.network_settings_str = '{}';
  form.encryption_settings_str = '{}';
  
  form.server_name = '';
  form.allow_insecure = 0;
  
  form.version = 2;
  form.up_mbps = 100;
  form.down_mbps = 100;
  form.obfs_password = '';
  form.insecure = 0;
  
  form.disable_sni = 0;
  form.udp_relay_mode = 'native';
  form.zero_rtt_handshake = 1;
  form.congestion_control = 'bbr';

  form.anytls_custom_str = '{}';
  form.v2node_custom_str = '{}';
  
  dialogVisible.value = true;
};

const openEditDialog = (row, type) => {
  isEdit.value = true;
  activeType.value = type;
  dialogTitle.value = `编辑 ${nodeTypes[type]} 节点`;
  
  form.id = row.id;
  form.name = row.name;
  form.rate = row.rate;
  form.group_id = row.group_id || [];
  form.host = row.host;
  form.port = row.port;
  form.server_port = row.server_port;
  form.parent_id = row.parent_id || 0;
  form.route_id = row.route_id || [];
  form.tags = row.tags || [];
  form.show = row.show;
  
  if (type === 'shadowsocks') {
    form.cipher = row.cipher || 'aes-256-gcm';
    form.obfs = row.obfs || null;
    form.obfs_settings_host = row.obfs_settings?.host || '';
    form.obfs_settings_path = row.obfs_settings?.path || '';
  } else if (type === 'vmess') {
    form.network = row.network || 'tcp';
    form.tls = row.tls || 0;
    form.vmess_security = row.networkSettings?.security || 'none';
    form.tlsSettings_str = JSON.stringify(row.tlsSettings || {}, null, 2);
    form.networkSettings_str = JSON.stringify(row.networkSettings || {}, null, 2);
    form.dnsSettings_str = JSON.stringify(row.dnsSettings || {}, null, 2);
    form.ruleSettings_str = JSON.stringify(row.ruleSettings || {}, null, 2);
  } else if (type === 'vless') {
    form.tls = row.tls || 0;
    form.network = row.network || 'tcp';
    form.flow = row.flow || null;
    form.encryption = row.encryption || 'none';
    form.tls_settings_str = JSON.stringify(row.tls_settings || {}, null, 2);
    form.network_settings_str = JSON.stringify(row.network_settings || {}, null, 2);
    form.encryption_settings_str = JSON.stringify(row.encryption_settings || {}, null, 2);
  } else if (type === 'trojan') {
    form.server_name = row.server_name || '';
    form.allow_insecure = row.allow_insecure || 0;
  } else if (type === 'hysteria') {
    form.version = row.version || 2;
    form.up_mbps = row.up_mbps || 0;
    form.down_mbps = row.down_mbps || 0;
    form.obfs = row.obfs || '';
    form.obfs_password = row.obfs_password || '';
    form.server_name = row.server_name || '';
    form.insecure = row.insecure || 0;
  } else if (type === 'tuic') {
    form.server_name = row.server_name || '';
    form.insecure = row.insecure || 0;
    form.disable_sni = row.disable_sni || 0;
    form.udp_relay_mode = row.udp_relay_mode || 'native';
    form.zero_rtt_handshake = row.zero_rtt_handshake || 0;
    form.congestion_control = row.congestion_control || 'bbr';
  } else if (type === 'anytls') {
    // Collect all other keys for custom AnyTLS structure
    const custom = { ...row };
    const omit = ['id', 'name', 'rate', 'group_id', 'host', 'port', 'server_port', 'parent_id', 'route_id', 'tags', 'show', 'type', 'created_at', 'updated_at'];
    omit.forEach(k => delete custom[k]);
    form.anytls_custom_str = JSON.stringify(custom, null, 2);
  } else if (type === 'v2node') {
    const custom = { ...row };
    const omit = ['id', 'name', 'rate', 'group_id', 'host', 'port', 'server_port', 'parent_id', 'route_id', 'tags', 'show', 'type', 'created_at', 'updated_at', 'install_command'];
    omit.forEach(k => delete custom[k]);
    form.v2node_custom_str = JSON.stringify(custom, null, 2);
  }

  dialogVisible.value = true;
};

const parseJSON = (str, fieldName) => {
  try {
    return JSON.parse(str || '{}');
  } catch (e) {
    throw new Error(`${fieldName} 的 JSON 格式不正确`);
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
        name: form.name,
        rate: form.rate,
        group_id: form.group_id,
        host: form.host,
        port: form.port,
        server_port: form.server_port,
        parent_id: form.parent_id || null,
        route_id: form.route_id || null,
        tags: form.tags || null,
        show: form.show,
      };

      if (isEdit.value) {
        payload.id = form.id;
      }
      
      // Append protocol specific configurations
      if (activeType.value === 'shadowsocks') {
        payload.cipher = form.cipher;
        payload.obfs = form.obfs;
        if (form.obfs === 'http') {
          payload.obfs_settings = {
            host: form.obfs_settings_host,
            path: form.obfs_settings_path
          };
        }
      } else if (activeType.value === 'vmess') {
        payload.network = form.network;
        payload.tls = form.tls;
        
        const tlsSettings = parseJSON(form.tlsSettings_str, 'TLS 配置');
        const networkSettings = parseJSON(form.networkSettings_str, '传输配置');
        const dnsSettings = parseJSON(form.dnsSettings_str, 'DNS 配置');
        const ruleSettings = parseJSON(form.ruleSettings_str, '规则配置');
        
        // Ensure security gets saved under networkSettings
        networkSettings.security = form.vmess_security;
        
        payload.tlsSettings = tlsSettings;
        payload.networkSettings = networkSettings;
        payload.dnsSettings = dnsSettings;
        payload.ruleSettings = ruleSettings;
      } else if (activeType.value === 'vless') {
        payload.tls = form.tls;
        payload.network = form.network;
        payload.flow = form.network === 'tcp' ? form.flow : null;
        payload.encryption = form.encryption;
        
        payload.tls_settings = parseJSON(form.tls_settings_str, 'TLS 配置');
        payload.network_settings = parseJSON(form.network_settings_str, '传输配置');
        payload.encryption_settings = parseJSON(form.encryption_settings_str, '加密配置');
      } else if (activeType.value === 'trojan') {
        payload.server_name = form.server_name;
        payload.allow_insecure = form.allow_insecure;
      } else if (activeType.value === 'hysteria') {
        payload.version = form.version;
        payload.up_mbps = form.up_mbps;
        payload.down_mbps = form.down_mbps;
        payload.server_name = form.server_name;
        payload.insecure = form.insecure;
        if (form.obfs) {
          payload.obfs = form.obfs;
          if (form.obfs_password) {
            payload.obfs_password = form.obfs_password;
          }
        }
      } else if (activeType.value === 'tuic') {
        payload.server_name = form.server_name;
        payload.insecure = form.insecure;
        payload.disable_sni = form.disable_sni;
        payload.udp_relay_mode = form.udp_relay_mode;
        payload.zero_rtt_handshake = form.zero_rtt_handshake;
        payload.congestion_control = form.congestion_control;
      } else if (activeType.value === 'anytls') {
        const custom = parseJSON(form.anytls_custom_str, '高级参数');
        Object.assign(payload, custom);
      } else if (activeType.value === 'v2node') {
        const custom = parseJSON(form.v2node_custom_str, '高级参数');
        Object.assign(payload, custom);
      }

      await api.post(`/${securePath}/server/${activeType.value}/save`, payload);
      ElMessage.success(isEdit.value ? '保存节点成功' : '创建节点成功');
      dialogVisible.value = false;
      fetchNodes();
    } catch (err) {
      ElMessage.error(err.message || '保存失败');
      console.error(err);
    } finally {
      submitLoading.value = false;
    }
  });
};

const handleCopy = async (row, type) => {
  try {
    const securePath = getSecurePath();
    await api.post(`/${securePath}/server/${type}/copy`, { id: row.id });
    ElMessage.success('复制节点成功');
    fetchNodes();
  } catch (err) {
    console.error(err);
  }
};

const handleDelete = (row, type) => {
  ElMessageBox.confirm('确定要永久删除该节点吗？此操作无法撤销！', '警告', {
    type: 'warning',
    confirmButtonText: '确定删除',
    cancelButtonText: '取消'
  }).then(async () => {
    const securePath = getSecurePath();
    await api.post(`/${securePath}/server/${type}/drop`, { id: row.id });
    ElMessage.success('节点删除成功');
    fetchNodes();
  }).catch(() => {});
};

onMounted(() => {
  fetchGroups();
  fetchRoutes();
  fetchNodes();
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

.node-tabs :deep(.el-tabs__item) {
  font-weight: 600;
  font-size: 14px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 15px;
  padding-left: 8px;
  border-left: 3px solid var(--el-color-primary);
}

.advanced-json-tabs {
  border-radius: 8px;
  overflow: hidden;
}

.code-textarea :deep(.el-textarea__inner) {
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  background-color: var(--el-fill-color-blank);
  color: var(--el-text-color-primary);
}

.mr-5 {
  margin-right: 5px;
}

.mt-20 {
  margin-top: 20px;
}

.mt-15 {
  margin-top: 15px;
}

.gap-10 {
  gap: 10px;
}
</style>
