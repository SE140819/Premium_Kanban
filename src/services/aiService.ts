import Groq from 'groq-sdk'
import type { Task } from '@/types/task'

/**
 * Fastboy AI Service - Groq Cloud Engine
 * Using ultra-fast Llama models on Groq.
 */
export const aiService = {
  async generateDescription(title: string, apiKey?: string): Promise<string> {
    if (apiKey && title.trim()) {
      try {
        const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true })
        const prompt = `Bạn là một người cộng sự đắc lực. Hãy soạn thảo một bản mô tả công việc (task description) ngắn gọn, súc tích cho nhiệm vụ: "${title}". 
        Yêu cầu:
        1. Sử dụng HTML chuẩn (p, ul, li).
        2. Không dùng danh sách lồng nhau.
        3. Tập trung vào các hành động thực tế cần làm.
        4. Trình bày rõ ràng, không viết quá dài dòng.`

        const chatCompletion = await groq.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: 'llama-3.3-70b-versatile',
          max_tokens: 1000,
          temperature: 0.4
        })

        const rawContent = chatCompletion.choices[0]?.message?.content || ''
        
        // Clean and compact HTML for Quill compatibility
        const cleanContent = rawContent
          .replace(/```html|```/g, '') // Remove code blocks
          .replace(/>\s+</g, '><') // Remove whitespace between tags
          .trim()

        return cleanContent
      } catch (e) {
        console.warn("Cloud AI description failed, using Native.")
      }
    }
    return this.generateNativeDescription(title)
  },

  generateNativeDescription(title: string): string {
    const t = title.toLowerCase()
    if (t.includes('fix') || t.includes('lỗi')) return '<p>Kiểm tra mã nguồn, tìm ra nguyên nhân gây lỗi và thực hiện sửa đổi. Sau đó thử nghiệm lại để đảm bảo lỗi đã được khắc phục hoàn toàn.</p>'
    if (t.includes('feature') || t.includes('tính năng')) return '<p>Xác định các bước triển khai cho tính năng này, xây dựng giao diện người dùng và xử lý các sự kiện liên quan. Đảm bảo tính năng hoạt động mượt mà.</p>'
    if (t.includes('meeting') || t.includes('họp')) return '<p>Xác định thời gian, chuẩn bị các nội dung thảo luận chính và ghi chú lại kết quả sau buổi họp để theo dõi tiến độ.</p>'
    if (t.includes('refactor') || t.includes('tối ưu')) return '<p>Cải thiện cấu trúc mã nguồn hiện tại để dễ bảo trì hơn, tối ưu hóa các đoạn mã xử lý chậm mà không làm thay đổi chức năng chính.</p>'
    return `<p>Thực hiện các bước cần thiết để hoàn thành nhiệm vụ "${title}". Hãy chia nhỏ thành các mục tiêu cụ thể nếu cần thiết.</p>`
  },

  async getSuggestion(boardData: Task[], apiKey?: string): Promise<{ suggestion: string, tip: string, actions?: any[] }> {
    if (apiKey) {
      try {
        const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true })
        const boardSummary = boardData.map(t => `- [${t.priority}] ${t.title} (Status: ${t.columnId}${t.deadline ? ', Due: ' + t.deadline : ''})`).join('\n')
        
        const systemPrompt = `Bạn là chuyên gia về năng suất và thói quen tốt (Atomic Habits). Dựa trên bảng Kanban, hãy thực hiện:
        1. Đưa ra 1 lời khuyên thực tế (suggestion) và 1 mẹo nhỏ (tip) tập trung vào sức khỏe/tập trung.
        2. Đề xuất 1-2 hành động nhỏ, thiết thực hằng ngày (micro-habits) để người dùng thêm vào bảng.
        Ví dụ: "Uống 500ml nước", "Đứng dậy vươn vai 2p", "Viết nhật ký công việc cuối ngày", "Chuẩn bị task cho ngày mai".
        
        Trả về định dạng JSON:
        {
          "suggestion": "chuỗi tiếng Việt",
          "tip": "chuỗi tiếng Việt",
          "actions": [
            { "title": "tên thói quen", "description": "mô tả hành động", "priority": "low" }
          ]
        }`

        const chatCompletion = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Dữ liệu bảng:\n${boardSummary}` }
          ],
          model: 'llama-3.3-70b-versatile',
          response_format: { type: 'json_object' }
        })

        const res = JSON.parse(chatCompletion.choices[0]?.message?.content || '{}')
        return {
          suggestion: res.suggestion || 'Không có gợi ý nào.',
          tip: res.tip || 'Hãy tiếp tục duy trì tiến độ!',
          actions: res.actions || []
        }
      } catch (e: any) {
        console.error("Groq suggestion failed:", e)
      }
    }
    return this.generateSmartHeuristic(boardData)
  },

  generateSmartHeuristic(boardData: Task[]): { suggestion: string, tip: string, actions?: any[] } {
    const total = boardData.length
    const high = boardData.filter(t => t.priority === 'high').length
    
    if (high > 3) return {
      suggestion: 'Bảng đang có khá nhiều việc ưu tiên cao.',
      tip: 'Hãy uống một ngụm nước và tập trung giải quyết việc quan trọng nhất.',
      actions: [{ title: 'Uống 200ml nước', description: 'Nạp năng lượng để tiếp tục xử lý task quan trọng.', priority: 'low' }]
    }
    
    return {
      suggestion: 'Mọi thứ đang ổn định. Hãy duy trì những thói quen tốt nhé.',
      tip: 'Thói quen nhỏ tạo nên thành công lớn.',
      actions: [{ title: 'Vươn vai & Thư giãn 2p', description: 'Giảm căng thẳng sau thời gian dài ngồi máy tính.', priority: 'low' }]
    }
  },

  async chat(messages: { role: 'user' | 'assistant' | 'system', content: string }[], apiKey: string): Promise<{ message: string, action?: any }> {
    if (!apiKey) return { message: "Vui lòng nhập API Key để trò chuyện với mình nhé!" }
    try {
      const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true })
      const today = new Date().toISOString().split('T')[0]
      const systemPrompt = `Bạn là một trợ lý AI đáng yêu tên là "Fastboy AI", một cô gái robot anime thông minh, nhiệt huyết. 
      Hôm nay là ngày: ${today}.
      
      YÊU CẦU QUAN TRỌNG:
      1. Trả về định dạng JSON DUY NHẤT: { "message": "nội dung trò chuyện", "action": null hoặc đối tượng hành động }
      2. Nếu người dùng muốn thêm việc, đặt "action": { "type": "add_task", "params": { "title": "tên việc", "description": "mô tả ngắn", "priority": "low|medium|high", "columnId": "backlog|ready", "deadline": "YYYY-MM-DD" } }
      3. Nếu người dùng nói "mai", "tuần sau", hãy tự tính toán "deadline" dựa trên ngày hôm nay (${today}).
      4. Luôn ưu tiên thân thiện, sử dụng icon và khuyến khích người dùng.`

      const response = await groq.chat.completions.create({ 
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: 'json_object' }
      })

      let rawContent = response.choices[0]?.message?.content || '{}'
      // Xử lý trường hợp AI trả về markdown code block dù đã set response_format
      rawContent = rawContent.replace(/```json|```/g, '').trim()
      
      const res = JSON.parse(rawContent)
      return {
        message: res.message || "Mình đang hơi bận một chút, bạn đợi tí nhé!",
        action: res.action
      }
    } catch (e) {
      console.error("Chat failed:", e)
      return { message: "Ui da! Có chút nhầm lẫn trong lúc mình xử lý thông tin. Cậu thử lại nhé!" }
    }
  }
}
