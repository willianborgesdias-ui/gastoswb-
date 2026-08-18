package com.example.data.export

import android.content.Context
import android.content.Intent
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Typeface
import android.graphics.pdf.PdfDocument
import androidx.core.content.FileProvider
import com.example.data.local.entity.TransactionEntity
import com.example.data.local.entity.UserAccount
import java.io.File
import java.io.FileOutputStream
import java.text.NumberFormat
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

object ReportExporter {

    private val ptBrLocale = Locale("pt", "BR")
    private val currencyFormat = NumberFormat.getCurrencyInstance(ptBrLocale)
    private val dateFormat = SimpleDateFormat("dd/MM/yyyy", ptBrLocale)
    private val dateTimeFormat = SimpleDateFormat("dd/MM/yyyy HH:mm", ptBrLocale)

    fun exportToCsv(
        context: Context,
        user: UserAccount?,
        transactions: List<TransactionEntity>,
        periodTitle: String
    ): File? {
        return try {
            val fileName = "Extrato_Financeiro_${System.currentTimeMillis()}.csv"
            val cacheDir = File(context.cacheDir, "exports").apply { mkdirs() }
            val file = File(cacheDir, fileName)

            FileOutputStream(file).bufferedWriter(Charsets.UTF_8).use { writer ->
                // UTF-8 BOM for Excel to open accents properly
                writer.write("\uFEFF")
                writer.write("RELATÓRIO FINANCEIRO - CONTROLE AUTÔNOMO / MEI\n")
                writer.write("Profissional:;${user?.fullName ?: "Autônomo"}\n")
                writer.write("Veículo:;${user?.vehicleModel ?: "N/A"} (${user?.vehiclePlate ?: ""})\n")
                writer.write("Período:;$periodTitle\n")
                writer.write("Gerado em:;${dateTimeFormat.format(Date())}\n\n")

                // CSV Header
                writer.write("Data;Tipo;Âmbito;Categoria;Descrição;Valor (R$);Método de Pagamento;KM Veículo;Litros;Observações\n")

                for (t in transactions) {
                    val dateStr = dateFormat.format(Date(t.date))
                    val typeStr = if (t.type == "INCOME") "Receita (Entrada)" else "Despesa (Saída)"
                    val scopeStr = if (t.scope == "PJ") "Pessoa Jurídica (PJ)" else "Pessoa Física (PF)"
                    val valueStr = String.format(ptBrLocale, "%.2f", t.amount)
                    val kmStr = t.vehicleKm?.toString() ?: ""
                    val litersStr = t.fuelLiters?.let { String.format(ptBrLocale, "%.2f", it) } ?: ""
                    val notesSanitized = t.notes.replace(";", ",").replace("\n", " ")
                    val titleSanitized = t.title.replace(";", ",").replace("\n", " ")

                    writer.write("$dateStr;$typeStr;$scopeStr;${t.category};$titleSanitized;$valueStr;${t.paymentMethod};$kmStr;$litersStr;$notesSanitized\n")
                }
            }
            file
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    fun exportToPdf(
        context: Context,
        user: UserAccount?,
        transactions: List<TransactionEntity>,
        periodTitle: String
    ): File? {
        val document = PdfDocument()
        return try {
            val pageWidth = 595 // Standard A4 width in PostScript points
            val pageHeight = 842 // Standard A4 height
            var pageNumber = 1

            var pageInfo = PdfDocument.PageInfo.Builder(pageWidth, pageHeight, pageNumber).create()
            var page = document.startPage(pageInfo)
            var canvas: Canvas = page.canvas

            val paint = Paint().apply { isAntiAlias = true }
            val titlePaint = Paint().apply {
                isAntiAlias = true
                typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
                textSize = 16f
                color = Color.rgb(15, 23, 42) // Dark Navy #0F172A
            }
            val subtitlePaint = Paint().apply {
                isAntiAlias = true
                textSize = 10f
                color = Color.rgb(100, 116, 139) // Slate #64748B
            }
            val boldPaint = Paint().apply {
                isAntiAlias = true
                typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
                textSize = 10f
                color = Color.rgb(30, 41, 59)
            }
            val textPaint = Paint().apply {
                isAntiAlias = true
                textSize = 9f
                color = Color.rgb(51, 65, 85)
            }

            var y = 40f
            val margin = 36f
            val contentWidth = pageWidth - (margin * 2)

            // Header Banner
            paint.color = Color.rgb(15, 23, 42)
            canvas.drawRoundRect(margin, y, margin + contentWidth, y + 65f, 8f, 8f, paint)

            titlePaint.color = Color.WHITE
            canvas.drawText("RELATÓRIO FINANCEIRO AUTÔNOMO", margin + 16f, y + 26f, titlePaint)
            titlePaint.color = Color.rgb(15, 23, 42) // Reset

            subtitlePaint.color = Color.rgb(148, 163, 184)
            canvas.drawText("Profissional: ${user?.fullName ?: "Autônomo"} | Veículo: ${user?.vehicleModel ?: "Moto"} (${user?.vehiclePlate ?: ""})", margin + 16f, y + 42f, subtitlePaint)
            canvas.drawText("Período: $periodTitle | Emitido em: ${dateTimeFormat.format(Date())}", margin + 16f, y + 54f, subtitlePaint)
            subtitlePaint.color = Color.rgb(100, 116, 139) // Reset

            y += 80f

            // Totals Summary Box
            val pjIncomes = transactions.filter { it.scope == "PJ" && it.type == "INCOME" }.sumOf { it.amount }
            val pjExpenses = transactions.filter { it.scope == "PJ" && it.type == "EXPENSE" }.sumOf { it.amount }
            val pfIncomes = transactions.filter { it.scope == "PF" && it.type == "INCOME" }.sumOf { it.amount }
            val pfExpenses = transactions.filter { it.scope == "PF" && it.type == "EXPENSE" }.sumOf { it.amount }

            val totalIncomes = pjIncomes + pfIncomes
            val totalExpenses = pjExpenses + pfExpenses
            val netBalance = totalIncomes - totalExpenses

            // Draw 3 Summary Cards
            val cardWidth = (contentWidth - 16f) / 3f

            // 1. Receitas
            paint.color = Color.rgb(240, 253, 244) // Light green #F0FDF4
            canvas.drawRoundRect(margin, y, margin + cardWidth, y + 50f, 6f, 6f, paint)
            boldPaint.color = Color.rgb(22, 101, 52)
            canvas.drawText("TOTAL RECEITAS", margin + 10f, y + 18f, boldPaint)
            boldPaint.textSize = 12f
            canvas.drawText(currencyFormat.format(totalIncomes), margin + 10f, y + 38f, boldPaint)
            boldPaint.textSize = 10f

            // 2. Despesas
            paint.color = Color.rgb(254, 242, 242) // Light red #FEF2F2
            canvas.drawRoundRect(margin + cardWidth + 8f, y, margin + (cardWidth * 2) + 8f, y + 50f, 6f, 6f, paint)
            boldPaint.color = Color.rgb(153, 27, 27)
            canvas.drawText("TOTAL DESPESAS", margin + cardWidth + 18f, y + 18f, boldPaint)
            boldPaint.textSize = 12f
            canvas.drawText(currencyFormat.format(totalExpenses), margin + cardWidth + 18f, y + 38f, boldPaint)
            boldPaint.textSize = 10f

            // 3. Saldo Líquido
            paint.color = if (netBalance >= 0) Color.rgb(236, 253, 245) else Color.rgb(254, 242, 242)
            canvas.drawRoundRect(margin + (cardWidth * 2) + 16f, y, margin + (cardWidth * 3) + 16f, y + 50f, 6f, 6f, paint)
            boldPaint.color = if (netBalance >= 0) Color.rgb(6, 95, 70) else Color.rgb(153, 27, 27)
            canvas.drawText("SALDO LÍQUIDO", margin + (cardWidth * 2) + 26f, y + 18f, boldPaint)
            boldPaint.textSize = 12f
            canvas.drawText(currencyFormat.format(netBalance), margin + (cardWidth * 2) + 26f, y + 38f, boldPaint)
            boldPaint.textSize = 10f

            y += 65f

            // Comparativo PF vs PJ
            paint.color = Color.rgb(241, 245, 249)
            canvas.drawRoundRect(margin, y, margin + contentWidth, y + 36f, 6f, 6f, paint)
            boldPaint.color = Color.rgb(30, 41, 59)
            canvas.drawText("DIVISÃO PJ vs PF:", margin + 12f, y + 22f, boldPaint)
            textPaint.color = Color.rgb(51, 65, 85)
            val pjNet = pjIncomes - pjExpenses
            val pfNet = pfIncomes - pfExpenses
            val pfPjSummary = "PJ Trabalho: Receitas ${currencyFormat.format(pjIncomes)} | Despesas ${currencyFormat.format(pjExpenses)} (Lucro: ${currencyFormat.format(pjNet)})   •   PF Pessoal: Despesas ${currencyFormat.format(pfExpenses)}"
            canvas.drawText(pfPjSummary, margin + 110f, y + 22f, textPaint)

            y += 50f

            // Transactions Table Header
            paint.color = Color.rgb(226, 232, 240)
            canvas.drawRect(margin, y, margin + contentWidth, y + 20f, paint)
            boldPaint.color = Color.rgb(15, 23, 42)
            canvas.drawText("DATA", margin + 6f, y + 14f, boldPaint)
            canvas.drawText("TIPO/ÂMBITO", margin + 65f, y + 14f, boldPaint)
            canvas.drawText("CATEGORIA / DESCRIÇÃO", margin + 150f, y + 14f, boldPaint)
            canvas.drawText("PAGAMENTO", margin + 355f, y + 14f, boldPaint)
            canvas.drawText("VALOR", margin + contentWidth - 65f, y + 14f, boldPaint)

            y += 24f

            // Table rows
            for ((index, t) in transactions.withIndex()) {
                if (y > pageHeight - 50f) {
                    document.finishPage(page)
                    pageNumber++
                    pageInfo = PdfDocument.PageInfo.Builder(pageWidth, pageHeight, pageNumber).create()
                    page = document.startPage(pageInfo)
                    canvas = page.canvas
                    y = 40f

                    // Repeat Table Header
                    paint.color = Color.rgb(226, 232, 240)
                    canvas.drawRect(margin, y, margin + contentWidth, y + 20f, paint)
                    boldPaint.color = Color.rgb(15, 23, 42)
                    canvas.drawText("DATA", margin + 6f, y + 14f, boldPaint)
                    canvas.drawText("TIPO/ÂMBITO", margin + 65f, y + 14f, boldPaint)
                    canvas.drawText("CATEGORIA / DESCRIÇÃO", margin + 150f, y + 14f, boldPaint)
                    canvas.drawText("PAGAMENTO", margin + 355f, y + 14f, boldPaint)
                    canvas.drawText("VALOR", margin + contentWidth - 65f, y + 14f, boldPaint)
                    y += 24f
                }

                if (index % 2 == 1) {
                    paint.color = Color.rgb(248, 250, 252)
                    canvas.drawRect(margin, y - 10f, margin + contentWidth, y + 12f, paint)
                }

                val dateStr = dateFormat.format(Date(t.date))
                val scopeTag = if (t.scope == "PJ") "[PJ]" else "[PF]"
                val typeTag = if (t.type == "INCOME") "Entrada" else "Saída"
                val desc = if (t.notes.isNotBlank()) "${t.title} (${t.notes})" else t.title
                val truncatedDesc = if (desc.length > 38) desc.take(35) + "..." else desc

                textPaint.color = Color.rgb(71, 85, 105)
                canvas.drawText(dateStr, margin + 6f, y + 2f, textPaint)
                canvas.drawText("$scopeTag $typeTag", margin + 65f, y + 2f, textPaint)
                canvas.drawText("${t.category}: $truncatedDesc", margin + 150f, y + 2f, textPaint)
                canvas.drawText(t.paymentMethod, margin + 355f, y + 2f, textPaint)

                val valColor = if (t.type == "INCOME") Color.rgb(22, 101, 52) else Color.rgb(185, 28, 28)
                boldPaint.color = valColor
                val sign = if (t.type == "INCOME") "+ " else "- "
                canvas.drawText(sign + currencyFormat.format(t.amount), margin + contentWidth - 65f, y + 2f, boldPaint)

                // Divider line
                paint.color = Color.rgb(241, 245, 249)
                canvas.drawLine(margin, y + 13f, margin + contentWidth, y + 13f, paint)

                y += 22f
            }

            document.finishPage(page)

            val fileName = "Relatorio_Financeiro_${System.currentTimeMillis()}.pdf"
            val cacheDir = File(context.cacheDir, "exports").apply { mkdirs() }
            val file = File(cacheDir, fileName)
            FileOutputStream(file).use { out ->
                document.writeTo(out)
            }
            file
        } catch (e: Exception) {
            e.printStackTrace()
            null
        } finally {
            document.close()
        }
    }

    fun shareFile(context: Context, file: File, mimeType: String, title: String) {
        val uri = FileProvider.getUriForFile(
            context,
            "${context.packageName}.fileprovider",
            file
        )

        val intent = Intent(Intent.ACTION_SEND).apply {
            type = mimeType
            putExtra(Intent.EXTRA_STREAM, uri)
            putExtra(Intent.EXTRA_SUBJECT, title)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }

        context.startActivity(Intent.createChooser(intent, "Compartilhar $title"))
    }
}
