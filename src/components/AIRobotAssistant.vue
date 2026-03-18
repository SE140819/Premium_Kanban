<template>
  <div
    class="ai-assistant-wrapper"
    :class="{ 'is-expanded': isExpanded, 'is-hidden': !isVisible }"
  >
    <div
      class="assistant-bubble shadow-premium"
      @click="isExpanded = !isExpanded"
    >
      <div class="avatar-pulse"></div>
      <img
        src="/C:/Users/DEV/.gemini/antigravity/brain/1b41bb8b-4974-4071-856e-6f5b5b95343b/ai_robot_assistant_avatar_1773803348647.png"
        alt="AI Assistant"
        class="robot-avatar"
      />
    </div>

    <transition name="slide-fade">
      <div
        v-if="isExpanded"
        class="suggestion-box shadow-premium"
      >
        <div class="suggestion-header">
          <div class="header-main">
            <span class="ai-badge">Trợ lý AI</span>
            <span class="ai-status">{{ isThinking ? 'Đang phân tích...' : 'Đã sẵn sàng' }}</span>
          </div>
          <div class="header-actions">
            <el-icon
              class="action-btn"
              @click="showConfig = !showConfig"
              title="Cấu hình API"
              ><Setting
            /></el-icon>
            <el-icon
              class="action-btn"
              @click.stop="isExpanded = false"
              ><Close
            /></el-icon>
          </div>
        </div>

        <div v-if="showConfig" class="config-panel">
          <p class="config-label">Nhập Gemini API Key (Miễn phí):</p>
          <div class="config-input-row">
            <el-input 
              v-model="apiKey" 
              placeholder="Dán key vào đây..." 
              size="small"
              type="password"
              show-password
            />
            <el-button 
              type="primary" 
              size="small" 
              @click="saveApiKey"
            >Lưu</el-button>
          </div>
          <a href="https://aistudio.google.com/app/apikey" target="_blank" class="key-link">Lấy Key miễn phí tại đây ↗</a>
        </div>

        <div class="suggestion-content" v-else>
          <div v-if="isThinking" class="thinking-state">
            <div class="loading-bar"></div>
            <p>Đang đọc bảng công việc của bạn...</p>
          </div>
          <div v-else>
            <p class="suggestion-text">
              {{ currentSuggestion }}
            </p>
            <div class="suggestion-footer">
              <span class="tip-label">Mẹo nhanh:</span>
              <span class="tip-text">{{ quickTip }}</span>
            </div>
            <el-button 
              v-if="apiKey"
              class="refresh-btn" 
              size="small" 
              link 
              @click="fetchRealSuggestion"
            >
              <el-icon><Refresh /></el-icon> Hỏi AI ngay
            </el-button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
  import { ref, computed, watch, onMounted } from 'vue'
  import { useTaskStore } from '../stores/taskStore'
  import { Setting, Refresh, Close } from '@element-plus/icons-vue'
  import { getAISuggestion } from '../services/aiService'

  const store = useTaskStore()
  const isExpanded = ref(true)
  const isVisible = ref(true)
  const isThinking = ref(false)
  const showConfig = ref(false)
  const apiKey = ref(localStorage.getItem('gemini_api_key') || '')

  const currentSuggestion = ref('Chào bạn! Tôi là Robot trợ lý. Hãy để tôi giúp bạn lên kế hoạch hiệu quả cho hôm nay nhé!')
  const quickTip = ref('Phân bổ thời gian hợp lý cho từng task.')

  const allTasks = computed(() => {
    return store.groups.flatMap(g => g.columns.flatMap(c => {
      return c.tasks.map(t => ({
        title: t.title,
        priority: t.priority,
        column: t.columnId,
        deadline: t.deadline
      }))
    }))
  })

  const saveApiKey = () => {
    localStorage.setItem('gemini_api_key', apiKey.value.trim())
    showConfig.value = false
    fetchRealSuggestion()
  }

  const fetchRealSuggestion = async () => {
    isThinking.value = true
    try {
      // The service now handles both real AI and a high-fidelity native fallback
      const result = await getAISuggestion(apiKey.value, allTasks.value)
      currentSuggestion.value = result.suggestion
      quickTip.value = result.tip
    } catch (error) {
      console.error('AI Error:', error)
      currentSuggestion.value = 'Hệ thống đang bận một chút, nhưng tôi vẫn khuyên bạn nên tập trung vào việc quan trọng nhất trước nhé!'
    } finally {
      isThinking.value = false
    }
  }

  // Update suggestion whenever tasks change
  watch(() => allTasks.value, (newTasks, oldTasks) => {
    if (apiKey.value && newTasks.length !== oldTasks?.length) {
      // fetchRealSuggestion() // Could add debounce
    }
  }, { deep: true })

  onMounted(() => {
    fetchRealSuggestion()
  })
</script>

<style scoped>
  /* Thêm các style mới */
  .header-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  
  .action-btn {
    cursor: pointer;
    font-size: 14px;
    opacity: 0.5;
    transition: all 0.2s;
  }
  
  .action-btn:hover {
    opacity: 1;
    color: #4f46e5;
  }

  .config-panel {
    padding: 8px 0;
  }
  
  .config-label {
    font-size: 11px;
    color: var(--text-secondary);
    margin-bottom: 8px;
  }
  
  .config-input-row {
    display: flex;
    gap: 8px;
  }
  
  .key-link {
    display: block;
    font-size: 10px;
    color: #4f46e5;
    margin-top: 8px;
    text-decoration: none;
  }

  .thinking-state {
    padding: 12px 0;
    text-align: center;
  }
  
  .thinking-state p {
    font-size: 12px;
    color: var(--text-secondary);
    margin-top: 8px;
  }

  .loading-bar {
    height: 3px;
    width: 100%;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
    position: relative;
    overflow: hidden;
  }
  
  .loading-bar::after {
    content: '';
    position: absolute;
    left: -50%;
    height: 100%;
    width: 50%;
    background: linear-gradient(90deg, transparent, #4f46e5, transparent);
    animation: loading 1.5s infinite linear;
  }
  
  @keyframes loading {
    to { left: 100%; }
  }

  .refresh-btn {
    margin-top: 12px;
    padding: 0 !important;
    font-size: 11px !important;
  }

  /* Chép lại style cũ */
  .ai-assistant-wrapper {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 12px;
  }

  .assistant-bubble {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    cursor: pointer;
    position: relative;
    border: 2px solid rgba(79, 70, 229, 0.4);
    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    background: #0d0d0d;
    padding: 2px;
  }

  .assistant-bubble:hover {
    transform: scale(1.1) rotate(5deg);
  }

  .robot-avatar {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }

  .avatar-pulse {
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    background: rgba(79, 70, 229, 0.2);
    animation: pulse 2s infinite;
    z-index: -1;
  }

  @keyframes pulse {
    0% { transform: scale(1); opacity: 1; }
    100% { transform: scale(1.4); opacity: 0; }
  }

  .suggestion-box {
    width: 320px;
    background: rgba(22, 22, 22, 0.8);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 16px;
    color: #fff;
    pointer-events: auto;
  }

  .suggestion-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .ai-badge {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    padding: 2px 8px;
    border-radius: 4px;
    margin-right: 8px;
  }

  .ai-status {
    font-size: 11px;
    color: var(--text-secondary);
    font-style: italic;
  }

  .close-btn {
    cursor: pointer;
    font-size: 14px;
    opacity: 0.5;
    transition: opacity 0.2s;
  }

  .close-btn:hover {
    opacity: 1;
  }

  .suggestion-text {
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 16px;
    color: #e2e8f0;
    font-weight: 500;
  }

  .suggestion-footer {
    padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  }

  .tip-label {
    display: block;
    font-size: 10px;
    font-weight: 600;
    color: #6366f1;
    text-transform: uppercase;
    margin-bottom: 2px;
  }

  .tip-text {
    font-size: 11px;
    color: var(--text-secondary);
  }

  /* Animations */
  .slide-fade-enter-active {
    transition: all 0.3s ease-out;
  }

  .slide-fade-leave-active {
    transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
  }

  .slide-fade-enter-from,
  .slide-fade-leave-to {
    transform: translateY(20px) scale(0.9);
    opacity: 0;
  }

  .shadow-premium {
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(79, 70, 229, 0.1);
  }

  /* Handle mobile */
  @media (max-width: 768px) {
    .ai-assistant-wrapper {
      bottom: 20px;
      right: 20px;
    }
    .suggestion-box {
      width: 280px;
    }
  }
</style>
