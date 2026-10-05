/**
 * 用户全能自适应头像引擎 (Avatar Engine) - EZ-Theme 版本
 */

export const PRESET_AVATARS = [
  { id: 'notion_1', name: '智者', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Felix' },
  { id: 'notion_2', name: '极客', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Aneka' },
  { id: 'notion_3', name: '探索者', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Milo' },
  { id: 'notion_4', name: '设计师', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Zoe' },
  { id: 'notion_5', name: '绅士', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Jasper' },
  { id: 'notion_6', name: '学者', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Luna' },
  { id: 'notion_7', name: '旅行者', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Leo' },
  { id: 'notion_8', name: '艺术家', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Maya' },
  { id: 'bot_1', name: '天阙 Alpha', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=NexusAlpha' },
  { id: 'bot_2', name: '赛博极光', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=CyberAurora' },
  { id: 'bot_3', name: '量子核心', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Quantum' },
  { id: 'bot_4', name: '霓虹风暴', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=NeonStorm' },
  { id: 'avatar_1', name: '潮流少年', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver' },
  { id: 'avatar_2', name: '都市白领', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia' },
  { id: 'avatar_3', name: '阳光青年', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ethan' },
  { id: 'avatar_4', name: '元气少女', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma' },
];

export function getAvatarStyleConfig() {
  if (typeof window !== 'undefined' && window.settings?.theme_config?.avatar_style) {
    return window.settings.theme_config.avatar_style;
  }
  return 'notion';
}

export function getUserCustomAvatar(email) {
  if (!email || typeof window === 'undefined') return '';
  try {
    return localStorage.getItem(`nexus_custom_avatar_${email}`) || '';
  } catch (e) {
    return '';
  }
}

export function getUserAvatarUrl(userInfo) {
  if (!userInfo) return '';
  const email = userInfo.email || '';

  const customAvatar = getUserCustomAvatar(email);
  if (customAvatar) {
    return customAvatar;
  }

  const style = getAvatarStyleConfig();
  const seed = encodeURIComponent(email || 'default');

  if (style === 'cravatar') {
    return userInfo.avatar_url || `https://cravatar.cn/avatar/${encodeURIComponent(email)}?s=64&d=identicon`;
  }

  if (style === 'bottts') {
    return `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;
  }

  if (style === 'avataaars') {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
  }

  return `https://api.dicebear.com/7.x/notionists/svg?seed=${seed}`;
}
