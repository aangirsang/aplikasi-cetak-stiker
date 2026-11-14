package com.girsang.stiker.ui

import com.girsang.stiker.AplikasiCetakStikerApplication
import java.awt.*
import javax.imageio.ImageIO
import javax.swing.*

class LoadingWindow {

    private val window = JWindow()
    private val logoLabel = JLabel().apply {
        horizontalAlignment = SwingConstants.CENTER
        verticalAlignment = SwingConstants.CENTER
    }

    init {
        //val bgColor = Color(24, 41, 88)
        val bgColor = Color(0, 147, 173)
        val textColor = Color(255, 255, 255)
        // Hanya bangun UI ringan di sini — TIDAK ada baca file/gambar
        val panel = JPanel(BorderLayout()).apply {
            //border = BorderFactory.createLineBorder(Color(220, 220, 220))
            background = bgColor
        }

        val titleLabel = JLabel("Aplikasi Cetak Stiker", SwingConstants.CENTER).apply {
            font = Font("Comic Sans MS", Font.BOLD, 23)
            foreground = textColor
            alignmentX = Component.CENTER_ALIGNMENT
        }

        val statusLabel = JLabel("Memulai aplikasi...", SwingConstants.CENTER).apply {
            font = Font("Comic Sans MS", Font.PLAIN, 15)
            foreground = textColor
            alignmentX = Component.CENTER_ALIGNMENT
        }

        val versionLabel = JLabel("v1.0.2", SwingConstants.CENTER).apply {
            font = Font("Comic Sans MS", Font.PLAIN, 12)
            foreground = textColor
            alignmentX = Component.CENTER_ALIGNMENT
        }

        val centerPanel = JPanel(GridBagLayout()).apply { background = bgColor }
        val gbc = GridBagConstraints().apply {
            gridx = 0; weightx = 1.0
            anchor = GridBagConstraints.CENTER
            fill = GridBagConstraints.NONE
        }

        gbc.gridy = 0; gbc.insets = Insets(10, 0, 10, 0)
        centerPanel.add(logoLabel, gbc)

        gbc.gridy = 1
        gbc.insets = Insets(0, 0, 0, 0)

        centerPanel.add(
            Box.createVerticalStrut(35), // tinggi spasi kosong 15px
            gbc
        )

        gbc.gridy = 2; gbc.insets = Insets(0, 0, 5, 0)
        centerPanel.add(titleLabel, gbc)

        gbc.gridy = 3; gbc.insets = Insets(0, 0, 10, 0)
        centerPanel.add(statusLabel, gbc)

        centerPanel.add(
            Box.createVerticalStrut(40), // tinggi spasi kosong 15px
            gbc
        )

        gbc.gridy = 4; gbc.insets = Insets(0, 0, 10, 0)
        centerPanel.add(versionLabel, gbc)

        val progressBar = JProgressBar().apply {
            isIndeterminate = true
            preferredSize = Dimension(420, 6)
        }

        panel.add(centerPanel, BorderLayout.CENTER)
        panel.add(progressBar, BorderLayout.SOUTH)

        window.contentPane = panel
        window.size = Dimension(420, 300)
        window.setLocationRelativeTo(null)
    }

    fun show() {
        // Tampilkan dulu window kosong (cepat) secara SINKRON di EDT
        SwingUtilities.invokeAndWait {
            window.isVisible = true
        }
        // Baru load logo di background, tidak menghalangi window tampil
        loadLogoAsync()
    }

    private fun loadLogoAsync() {
        Thread {
            try {
                val inputStream = AplikasiCetakStikerApplication::class.java
                    .getResourceAsStream("/static/assets/images/RB Putih.png")

                if (inputStream == null) {
                    println("LOGO TIDAK DITEMUKAN")
                    return@Thread
                }

                val image = ImageIO.read(inputStream)
                inputStream.close()

                val maxWidth = 200
                val maxHeight = 200
                val scale = minOf(
                    maxWidth.toDouble() / image.width,
                    maxHeight.toDouble() / image.height
                )
                val width = (image.width * scale).toInt()
                val height = (image.height * scale).toInt()

                val icon = ImageIcon(
                    image.getScaledInstance(width, height, Image.SCALE_SMOOTH)
                )

                SwingUtilities.invokeLater {
                    logoLabel.icon = icon
                }

            } catch (e: Exception) {
                println("Gagal memuat logo")
                e.printStackTrace()
            }
        }.apply { isDaemon = true }.start()
    }

    fun close() {
        SwingUtilities.invokeLater {
            window.dispose()
        }
    }
}