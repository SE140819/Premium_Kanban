<template>
  <aside
    class="sidebar"
    :class="{ 'is-mobile-open': isOpen }"
  >
    <div class="sidebar-header">
      <div class="brand">
        <div class="brand-logomark">
          <el-icon><Platform /></el-icon>
        </div>
        <span class="brand-name">Fastboy</span>
      </div>
      <div class="header-actions">
        <el-icon class="icon-btn" @click="comingSoon"><Search /></el-icon>
        <el-icon class="icon-btn" @click="comingSoon"><EditPen /></el-icon>
      </div>
    </div>

    <nav class="sidebar-nav">
      <div class="nav-section">
        <div class="nav-item" @click="comingSoon">
          <el-icon><Odometer /></el-icon>
          <span>Pulse</span>
        </div>
        <div class="nav-item" @click="comingSoon">
          <el-icon><Message /></el-icon>
          <span>Inbox</span>
        </div>
        <div class="nav-item" @click="comingSoon">
          <el-icon><User /></el-icon>
          <span>My issues</span>
        </div>
      </div>

      <div class="nav-section">
        <h3 class="section-title">Workspace</h3>
        <div class="nav-item" @click="comingSoon">
          <el-icon><Operation /></el-icon>
          <span>Initiatives</span>
        </div>
        <div class="nav-item active">
          <el-icon><Finished /></el-icon>
          <span>Projects</span>
        </div>
        <div class="nav-item" @click="comingSoon">
          <el-icon><View /></el-icon>
          <span>Views</span>
        </div>
        <div class="nav-item more" @click="comingSoon">
          <el-icon><MoreFilled /></el-icon>
          <span>More</span>
        </div>
      </div>

      <div class="nav-section">
        <h3 class="section-title">Your teams</h3>
      </div>

      <div class="nav-section">
        <h3 class="section-title">Try</h3>
        <div class="nav-item transparent" @click="comingSoon">
          <el-icon><Connection /></el-icon>
          <span>Connect Cursor</span>
        </div>
        <div class="nav-item transparent" @click="comingSoon">
          <el-icon><MagicStick /></el-icon>
          <span>Connect Codex</span>
        </div>
      </div>
    </nav>

    <div class="sidebar-footer">
      <div class="user-profile">
        <div class="avatar-placeholder">P</div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
  import {
    Platform,
    Search,
    EditPen,
    Odometer,
    Message,
    User,
    Operation,
    Finished,
    View,
    MoreFilled,
    Connection,
    MagicStick
  } from '@element-plus/icons-vue'
  import { notify } from '@/utils/notification'

  interface Props {
    isOpen: boolean
  }

  defineProps<Props>()

  const comingSoon = () => {
    notify.info('This feature is coming soon!')
  }
</script>

<style scoped>
  .sidebar {
    width: 240px;
    height: 100vh;
    background-color: #0d0d0d;
    border-right: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    flex-direction: column;
    color: #8a8a8e;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1000;
  }

  @media (max-width: 768px) {
    .sidebar {
      position: fixed;
      left: 0;
      top: 0;
      transform: translateX(-100%);
    }

    .sidebar.is-mobile-open {
      transform: translateX(0);
    }
  }

  .sidebar-header {
    padding: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #fff;
    font-weight: 500;
  }

  .brand-logomark {
    width: 24px;
    height: 24px;
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
  }

  .header-actions {
    display: flex;
    gap: 12px;
    font-size: 16px;
  }

  .icon-btn {
    cursor: pointer;
    transition: color 0.2s;
  }

  .icon-btn:hover {
    color: #fff;
  }

  .sidebar-nav {
    flex: 1;
    overflow-y: auto;
    padding: 8px 12px;
  }

  .nav-section {
    margin-bottom: 24px;
  }

  .section-title {
    padding: 0 8px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 8px;
    color: #4b4b4f;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 8px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    margin-bottom: 2px;
  }

  .nav-item:hover {
    background-color: rgba(255, 255, 255, 0.05);
    color: #fff;
  }

  .nav-item.active {
    background-color: rgba(255, 255, 255, 0.08);
    color: #fff;
    font-weight: 500;
  }

  .nav-item el-icon {
    font-size: 16px;
  }

  .nav-item.transparent {
    opacity: 0.6;
  }

  .nav-item.transparent:hover {
    opacity: 1;
  }

  .sidebar-footer {
    padding: 12px 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  }

  .avatar-placeholder {
    width: 24px;
    height: 24px;
    background-color: #3b82f6;
    color: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
  }
</style>
