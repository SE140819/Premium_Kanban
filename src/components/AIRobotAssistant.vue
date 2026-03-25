<template>
  <div
    class="ai-assistant-wrapper"
    :class="{ 'is-expanded': isExpanded, 'is-hidden': !isVisible }"
    @mousemove="handleMouseMove"
    @mouseleave="resetTilt"
  >
    <div
      class="assistant-bubble shadow-premium"
      @click="isExpanded = !isExpanded"
    >
      <div class="hologram-container">
        <div class="hologram-ring ring-1"></div>
        <div class="hologram-ring ring-2"></div>
        <div class="hologram-character" :class="{ 'is-thinking': isThinking }">
          <img src="@/assets/ai-anime.png" alt="Anime AI" />
        </div>
        <div class="hologram-scanner"></div>
      </div>
    </div>

    <transition name="slide-fade">
      <div
        v-if="isExpanded"
        class="suggestion-box shadow-premium"
        :style="boxStyle"
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
          <p class="config-label">Nhập Groq API Key (Siêu nhanh):</p>
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
          <a href="https://console.groq.com/" target="_blank" class="key-link">Lấy Key Groq tại đây ↗</a>
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
            <div v-if="suggestedActions.length > 0" class="suggested-actions">
              <p class="section-title">Hành động đề xuất ✨</p>
              <div 
                v-for="(action, idx) in suggestedActions" 
                :key="idx" 
                class="action-card"
              >
                <div class="action-info">
                  <span class="action-title">{{ action.title }}</span>
                  <span class="action-desc">{{ action.description }}</span>
                </div>
                <el-button 
                  type="primary" 
                  size="small" 
                  circle 
                  @click="handleCreateSuggestedTask(action)"
                >
                  <el-icon><Plus /></el-icon>
                </el-button>
              </div>
            </div>

            <el-button 
              v-if="apiKey"
              class="refresh-btn" 
              size="small" 
              link 
              @click="fetchRealSuggestion"
            >
              <el-icon><Refresh /></el-icon> Làm mới gợi ý
            </el-button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
  import aiAnime from '@/assets/ai-anime.png'
import { aiService } from '@/services/aiService'
import { useTaskStore } from '@/stores/taskStore'
import type { Task } from '@/types/task'
import { Close, Refresh, Setting, Plus } from '@element-plus/icons-vue'
import { computed, onMounted, ref, watch } from 'vue'

  const store = useTaskStore()
  const isExpanded = ref(true)
  const isVisible = ref(true)
  const isThinking = ref(false)
  const showConfig = ref(false)
  const apiKey = ref(localStorage.getItem('groq_api_key') || '')

  const currentSuggestion = ref('Đang phân tích bảng của bạn...')
  const quickTip = ref('Phím tắt: Ctrl + N để thêm task nhanh.')
  const suggestedActions = ref<any[]>([])
  
  // 3D Tilt Logic
  const mouseX = ref(0)
  const mouseY = ref(0)
  const tiltX = ref(0)
  const tiltY = ref(0)

  const handleMouseMove = (e: MouseEvent) => {
    if (!isExpanded.value) return
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Calculate tilt (-10 to 10 degrees)
    tiltX.value = (y / rect.height - 0.5) * 20
    tiltY.value = (x / rect.width - 0.5) * -20
  }

  const resetTilt = () => {
    tiltX.value = 0
    tiltY.value = 0
  }

  const boxStyle = computed(() => ({
    transform: `perspective(1000px) rotateX(${tiltX.value}deg) rotateY(${tiltY.value}deg)`,
    transition: 'transform 0.1s ease-out'
  }))
  const allTasks = computed<Task[]>(() => {
    return store.groups.flatMap(g => g.columns.flatMap(c => c.tasks))
  })

  const saveApiKey = () => {
    localStorage.setItem('groq_api_key', apiKey.value.trim())
    showConfig.value = false
    fetchRealSuggestion()
  }

  const fetchRealSuggestion = async () => {
    isThinking.value = true
    try {
      // The service now handles both real AI and a high-fidelity native fallback
      const res = await aiService.getSuggestion(allTasks.value, apiKey.value)
      currentSuggestion.value = res.suggestion
      quickTip.value = res.tip
      suggestedActions.value = res.actions || []
    } catch (error: any) {
      console.error('AI Error:', error)
      const errorMsg = error?.message || ''
      
      if (errorMsg.includes('quota') || errorMsg.includes('429')) {
        currentSuggestion.value = '🔴 Bạn đã hết lượt dùng thử Groq. Hãy thử lại sau vài phút!'
        quickTip.value = 'Chờ reset quota hoặc dùng key cá nhân để tiếp tục.'
      } else if (errorMsg.includes('API_KEY_INVALID')) {
        currentSuggestion.value = '⚠️ Groq API Key không hợp lệ. Vui lòng kiểm tra lại cấu hình!'
      } else {
        const fallback = aiService.generateSmartHeuristic(allTasks.value)
        currentSuggestion.value = fallback.suggestion
        quickTip.value = fallback.tip
        suggestedActions.value = fallback.actions || []
      }
    } finally {
      isThinking.value = false
    }
  }

  const handleCreateSuggestedTask = async (action: any) => {
    try {
      await store.addTask('ready', {
        title: action.title,
        description: action.description,
        priority: action.priority || 'medium',
        deadline: null
      })
      // Xóa action sau khi tạo thành công
      suggestedActions.value = suggestedActions.value.filter(a => a !== action)
    } catch (e) {
      console.error("Failed to add AI task:", e)
    }
  }

  // Update suggestion whenever tasks change
  watch(() => allTasks.value, (newTasks, oldTasks) => {
    if (newTasks.length !== oldTasks?.length) {
      setTimeout(fetchRealSuggestion, 1000)
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
    opacity: 0.7;
  }

  .suggested-actions {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  }

  .section-title {
    font-size: 11px;
    font-weight: 700;
    color: #a855f7;
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .action-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    padding: 10px 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
    transition: all 0.2s;
  }

  .action-card:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(168, 85, 247, 0.3);
    transform: translateX(4px);
  }

  .action-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
  }

  .action-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .action-desc {
    font-size: 11px;
    color: var(--text-secondary);
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Chép lại style cũ */
  /* --- Hologram Orb Style --- */
  .hologram-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: 50%;
    background: radial-gradient(circle at center, rgba(79, 70, 229, 0.2) 0%, transparent 70%);
  }

  .hologram-character {
    position: absolute;
    width: 50px;
    height: 50px;
    z-index: 2;
    transform-style: preserve-3d;
    filter: drop-shadow(0 0 10px rgba(79, 70, 229, 0.4));
    animation: character-float 3s infinite ease-in-out;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .hologram-character img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 50%;
  }

  .hologram-character::after {
    content: '';
    position: absolute;
    inset: -5px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(79, 70, 229, 0.2) 0%, transparent 70%);
    z-index: -1;
  }

  .hologram-character.is-thinking {
    filter: drop-shadow(0 0 15px rgba(168, 85, 247, 0.6));
    animation: character-thinking 0.3s infinite alternate ease-in-out;
  }

  @keyframes character-float {
    0%, 100% { transform: translateY(0) scale(1.1); }
    50% { transform: translateY(-5px) scale(1.15); }
  }

  @keyframes character-thinking {
    from { transform: scale(1.1); }
    to { transform: scale(1.2); }
  }

  /* (removed old hologram-core) */

  .hologram-ring {
    position: absolute;
    border: 1px solid rgba(79, 70, 229, 0.3);
    border-radius: 50%;
  }

  .ring-1 {
    width: 40px;
    height: 40px;
    animation: rotate 4s infinite linear;
  }

  .ring-2 {
    width: 48px;
    height: 48px;
    border-style: dashed;
    animation: rotate 6s infinite linear reverse;
    opacity: 0.5;
  }

  .hologram-scanner {
    position: absolute;
    top: -100%;
    left: 0;
    width: 100%;
    height: 200%;
    background: linear-gradient(to bottom, transparent, rgba(79, 70, 229, 0.4), transparent);
    animation: scan 3s infinite linear;
    pointer-events: none;
  }

  @keyframes core-breathe {
    0%, 100% { transform: scale(1); opacity: 0.8; }
    50% { transform: scale(1.2); opacity: 1; }
  }

  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes scan {
    0% { transform: translateY(0); }
    100% { transform: translateY(100%); }
  }

  /* --- Repositioned Suggestions --- */
  .ai-assistant-wrapper {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 12px;
    perspective: 1000px; /* Essential for 3D tilt */
  }

  .assistant-bubble {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    cursor: pointer;
    position: relative;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(13, 13, 13, 0.6);
    backdrop-filter: blur(8px);
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 30px rgba(79, 70, 229, 0.3);
  }

  .assistant-bubble:hover {
    transform: scale(1.1) translateY(-5px);
    border-color: rgba(79, 70, 229, 0.6);
    box-shadow: 0 0 50px rgba(79, 70, 229, 0.5);
  }

  .suggestion-box {
    width: 340px;
    background: rgba(18, 18, 23, 0.85);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    padding: 20px;
    color: #fff;
    pointer-events: auto;
    transform-style: preserve-3d; /* Smooth 3D tilt */
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(79, 70, 229, 0.1);
  }

  .shadow-premium {
    /* Refined with neon floor shadow */
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4), 
                0 0 20px rgba(79, 70, 229, 0.05),
                inset 0 0 1px 1px rgba(255,255,255,0.05);
  }

  .suggestion-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    position: relative;
    z-index: 10;
  }

  .ai-badge {
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    padding: 3px 10px;
    border-radius: 6px;
    margin-right: 10px;
    box-shadow: 0 4px 10px rgba(79, 70, 229, 0.4);
  }

  .ai-status {
    font-size: 11px;
    color: var(--text-secondary);
    font-style: italic;
    opacity: 0.8;
  }

  .suggestion-text {
    font-size: 15px;
    line-height: 1.6;
    margin-bottom: 20px;
    color: #f1f5f9;
    font-weight: 500;
    position: relative;
    z-index: 5;
  }

  .suggestion-footer {
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  }

  .tip-label {
    display: block;
    font-size: 10px;
    font-weight: 700;
    color: #6366f1;
    text-transform: uppercase;
    margin-bottom: 4px;
    letter-spacing: 0.05em;
  }

  .tip-text {
    font-size: 12px;
    color: var(--text-secondary);
    line-height: 1.4;
  }

  /* Animations */
  .slide-fade-enter-active {
    transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .slide-fade-leave-active {
    transition: all 0.3s cubic-bezier(0.7, 0, 0.84, 0);
  }

  .slide-fade-enter-from,
  .slide-fade-leave-to {
    transform: translateY(30px) scale(0.9) rotateX(-10deg);
    opacity: 0;
    filter: blur(10px);
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
