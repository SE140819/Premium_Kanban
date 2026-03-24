import { GoogleGenerativeAI } from '@google/generative-ai'
import type { Task } from '@/types/task'

const GEMINI_API_KEY = 'AIzaSyDyJ2K41Lxr1ztBtj_ZbLr_7ycr0s2ni5g'

/**
 * Optimized AI Assistant Service
 */
export const aiService = {
  async getSuggestion(boardData: Task[], apiKey?: string): Promise<{ suggestion: string, tip: string }> {
    const token = apiKey || GEMINI_API_KEY
    if (token) {
      try {
        const genAI = new GoogleGenerativeAI(token)
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })
        const prompt = `Bạn là trợ lý ảo Fastboy. Hãy phân tích: ${JSON.stringify(boardData)}. Trả về JSON: { "suggestion": "...", "tip": "..." }.`
        
        const result = await model.generateContent(prompt)
        const jsonMatch = result.response.text().match(/\{[\s\S]*\}/)
        if (jsonMatch) return JSON.parse(jsonMatch[0])
      } catch (e) {
        console.warn("AI fallback active.")
      }
    }
    return this.generateNativeSuggestion(boardData)
  },

  generateNativeSuggestion(tasks: Task[]): { suggestion: string, tip: string } {
    if (!tasks?.length) return {
      suggestion: "Bảng trống. Hãy thêm mục tiêu vào 'Backlog'!",
      tip: "Chia nhỏ dự án lớn thành các bước dễ thực hiện."
    }

    const inProgress = tasks.filter(t => t.columnId === 'in-progress')
    const highPriority = tasks.filter(t => t.priority === 'high')
    const backlog = tasks.filter(t => ['backlog', 'waiting'].includes(t.columnId))

    if (inProgress.length > 3) return {
      suggestion: `Bạn đang có ${inProgress.length} việc đang làm. Hãy tập trung hoàn tất chúng!`,
      tip: "Quy tắc 80/20: Tập trung vào 20% việc quan trọng nhất."
    }
    
    if (highPriority.length > 0) return {
      suggestion: `Có ${highPriority.length} việc quan trọng. Giải quyết chúng ngay nào.`,
      tip: "Eat the frog: Làm việc khó nhất vào buổi sáng."
    }
    
    if (backlog.length > 5) return {
      suggestion: "Danh sách chờ hơi dài. Hãy lọc ra 3 việc cần thiết nhất.",
      tip: "Less is more: Làm ít nhưng chất lượng."
    }

    return {
      suggestion: "Mọi thứ đang ổn! Duy trì đà này nhé.",
      tip: "Nghỉ ngơi 5 phút mỗi giờ để nạp lại năng lượng."
    }
  }
}
