package com.girsang.stiker.ui

import com.girsang.stiker.AplikasiCetakStikerApplication
import java.awt.*
import javax.imageio.ImageIO
import javax.swing.*

class LoadingWindow {

    private val window = JWindow()

    init {

        // =========================
        // PANEL UTAMA
        // =========================

        val panel = JPanel(BorderLayout()).apply {
            border = BorderFactory.createLineBorder(
                Color(220, 220, 220)
            )
            background = Color.WHITE
        }

        // =========================
        // LOGO
        // =========================

        val logoLabel = JLabel().apply {

            horizontalAlignment = SwingConstants.CENTER
            verticalAlignment = SwingConstants.CENTER

            try {

                val inputStream =
                    AplikasiCetakStikerApplication::class.java
                        .getResourceAsStream(
                            "/static/assets/images/RB Hitam.png"
                        )

                if (inputStream == null) {

                    println("LOGO TIDAK DITEMUKAN")

                } else {

                    val image = ImageIO.read(inputStream)

                    println(
                        "Logo berhasil dibaca: " +
                                "${image.width}x${image.height}"
                    )

                    val maxWidth = 150
                    val maxHeight = 150

                    val scale = minOf(
                        maxWidth.toDouble() / image.width,
                        maxHeight.toDouble() / image.height
                    )

                    val width =
                        (image.width * scale).toInt()

                    val height =
                        (image.height * scale).toInt()

                    println(
                        "Logo setelah resize: " +
                                "${width}x${height}"
                    )

                    icon = ImageIcon(
                        image.getScaledInstance(
                            width,
                            height,
                            Image.SCALE_SMOOTH
                        )
                    )

                    inputStream.close()
                }

            } catch (e: Exception) {

                println("Gagal memuat logo")
                e.printStackTrace()
            }
        }

        // =========================
        // TITLE
        // =========================

        val titleLabel = JLabel(
            "Aplikasi Cetak Stiker",
            SwingConstants.CENTER
        ).apply {

            font = Font(
                "Comic Sans MS",
                Font.BOLD,
                20
            )

            alignmentX = Component.CENTER_ALIGNMENT
        }

        // =========================
        // STATUS
        // =========================

        val statusLabel = JLabel(
            "Memulai aplikasi...",
            SwingConstants.CENTER
        ).apply {

            font = Font(
                "Segoe Print",
                Font.PLAIN,
                12
            )

            alignmentX = Component.CENTER_ALIGNMENT
        }

        // =========================
        // CONTENT PANEL
        // =========================

        val centerPanel = JPanel(
            GridBagLayout()
        ).apply {

            background = Color.WHITE
        }

        val gbc = GridBagConstraints().apply {

            gridx = 0
            weightx = 1.0

            anchor = GridBagConstraints.CENTER

            fill = GridBagConstraints.NONE
        }

        // =========================
        // LOGO
        // =========================

        gbc.gridy = 0

        gbc.insets = Insets(
            10,
            0,
            10,
            0
        )

        centerPanel.add(
            logoLabel,
            gbc
        )

        // =========================
        // TITLE
        // =========================

        gbc.gridy = 1

        gbc.insets = Insets(
            0,
            0,
            5,
            0
        )

        centerPanel.add(
            titleLabel,
            gbc
        )

        // =========================
        // STATUS
        // =========================

        gbc.gridy = 2

        gbc.insets = Insets(
            0,
            0,
            10,
            0
        )

        centerPanel.add(
            statusLabel,
            gbc
        )

        // =========================
        // PROGRESS BAR
        // =========================

        val progressBar = JProgressBar().apply {

            isIndeterminate = true

            preferredSize = Dimension(
                420,
                6
            )
        }

        // =========================
        // MASUKKAN PANEL
        // =========================

        panel.add(
            centerPanel,
            BorderLayout.CENTER
        )

        panel.add(
            progressBar,
            BorderLayout.SOUTH
        )

        // =========================
        // WINDOW
        // =========================

        window.contentPane = panel

        window.size = Dimension(
            420,
            300
        )

        window.setLocationRelativeTo(null)
    }

    fun show() {

        SwingUtilities.invokeLater {
            window.isVisible = true
        }
    }

    fun close() {

        SwingUtilities.invokeLater {
            window.dispose()
        }
    }
}