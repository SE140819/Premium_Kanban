import { GoogleGenerativeAI } from '@google/generative-ai'
import type { Task } from '@/types/task'

const GEMINI_API_KEY = 'AIzaSyDyJ2K41Lxr1ztBtj_ZbLr_7ycr0s2ni5g'

export const getAISuggestion = async (apiKey: string | null, boardData: Task[]): Promise<{ suggestion: string, tip: string }> => {
  const token = apiKey || GEMINI_API_KEY
  
  if (token) {
    try {
      const genAI = new GoogleGenerativeAI(token)
      // gemini-1.5-flash-latest is often the fix for 404 on some regional keys
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })
      const prompt = `Bạn là trợ lý ảo Fastboy. Hãy phân tích các công việc sau: ${JSON.stringify(boardData)}. 
      Đưa ra 1 gợi ý và 1 mẹo nhỏ bằng tiếng Việt. Trả về JSON: { "suggestion": "...", "tip": "..." }.`
      
      const result = await model.generateContent(prompt)
      const text = result.response.text()
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) return JSON.parse(jsonMatch[0])
    } catch (e) {
      // Ssssh... Fallback to local brain
      console.log("Gemini API not available, using local processing.")
    }
  }

  return generateNativeSuggestion(boardData)
}

const generateNativeSuggestion = (tasks: any[]): { suggestion: string, tip: string } => {
  if (!tasks || tasks.length === 0) {
    return {
      suggestion: "Bảng của bạn đang trống. Hãy bắt đầu bằng cách thêm một vài mục tiêu vào 'Backlog' nhé!",
      tip: "Chia nhỏ dự án lớn thành các bước nhỏ dễ thực hiện hơn."
    }
  }

  // Column IDs from taskStore.ts: backlog, waiting, ready, in-progress, done
  const inProgress = tasks.filter(t => t.columnId === 'in-progress' || t.column === 'in-progress')
  const backlog = tasks.filter(t => t.columnId === 'backlog' || t.column === 'backlog' || t.columnId === 'waiting' || t.column === 'waiting')
  const highPriority = tasks.filter(t => t.priority === 'high' || t.priority === 'urgent')

  let suggestion = "Mọi thứ đang được kiểm soát rất tốt! Hãy duy trì đà làm việc này để sớm về đích nhé."
  let tip = "Nghỉ ngơi 5 phút mỗi giờ làm việc để tái tạo năng lượng."

  if (inProgress.length > 3) {
    suggestion = `Bạn đang xử lý ${inProgress.length} công việc cùng lúc. Hãy ưu tiên hoàn thành chúng trước khi nhận thêm việc mới để tránh quá tải!`
    tip = "Quy tắc 80/20: Focus vào 20% việc quan trọng nhất."
  } else if (highPriority.length > 0) {
    suggestion = `Bạn có ${highPriority.length} công việc quan trọng cần ưu tiên. 'Giải quyết' chúng ngay bây giờ sẽ giúp bạn bớt căng thẳng hơn đó.`
    tip = "Eat the frog: Làm việc khó nhất ngay vào buổi sáng."
  } else if (backlog.length > 5) {
    suggestion = `Danh sách chờ (Backlog) đang hơi dài. Hãy dành chút thời gian lọc lại và chọn ra 3 việc cần làm nhất hôm nay.`
    tip = "Less is more: Làm ít nhưng chất lượng."
  }

  return { suggestion, tip }
}
