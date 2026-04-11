import jsPDF from 'jspdf'

interface AnalysisResult {
  mode: string
  input: any
  output: any
  createdAt: string
}

export function exportAnalysisToPDF(analysis: AnalysisResult): void {
  const doc = new jsPDF()
  
  // Header
  doc.setFontSize(22)
  doc.setTextColor(79, 70, 229) // indigo
  doc.text('ReloAI — Relocation Analysis', 20, 25)
  
  // Date
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(`Generated: ${new Date(analysis.createdAt).toLocaleDateString()}`, 20, 35)
  doc.text(`relo-ai-7rj3.vercel.app`, 20, 42)
  
  // Divider line
  doc.setDrawColor(200, 200, 200)
  doc.line(20, 48, 190, 48)
  
  // Analysis type
  doc.setFontSize(14)
  doc.setTextColor(0, 0, 0)
  doc.text(`Analysis Type: ${analysis.mode.toUpperCase()}`, 20, 60)
  
  // Output content
  doc.setFontSize(11)
  let yPos = 75
  
  if (analysis.output?.countries) {
    doc.text('Top Countries:', 20, yPos)
    yPos += 10
    analysis.output.countries.slice(0, 5).forEach((country: any, i: number) => {
      doc.setFontSize(10)
      doc.text(
        `${i + 1}. ${country.name} — Score: ${country.score}/100`, 
        25, yPos
      )
      yPos += 7
      if (country.cost) {
        doc.text(`   Cost of living: ${country.cost}`, 25, yPos)
        yPos += 7
      }
      if (country.visa) {
        doc.text(`   Visa: ${country.visa}`, 25, yPos)
        yPos += 10
      }
    })
  }
  
  if (analysis.output?.phases) {
    doc.text('Relocation Plan:', 20, yPos)
    yPos += 10
    analysis.output.phases.forEach((phase: any) => {
      doc.setFontSize(11)
      doc.text(`${phase.title} (${phase.duration})`, 25, yPos)
      yPos += 7
      phase.steps?.forEach((step: string) => {
        doc.setFontSize(9)
        doc.text(`  • ${step}`, 28, yPos)
        yPos += 6
      })
      yPos += 5
    })
  }
  
  // Footer
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text('ReloAI — AI-powered relocation intelligence', 20, 285)
  
  // Save
  doc.save(`reloai-analysis-${analysis.mode}-${Date.now()}.pdf`)
}
