package com.girsang.stiker

import com.girsang.stiker.config.AppPathProvider
import com.girsang.stiker.ui.LoadingWindow
import java.awt.*
import java.net.URI
import javax.imageio.ImageIO
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.ConfigurationPropertiesScan
import org.springframework.boot.runApplication
import java.awt.image.BufferedImage
import javax.swing.JOptionPane

@SpringBootApplication
@ConfigurationPropertiesScan
class AplikasiCetakStikerApplication

fun main(args: Array<String>) {

	System.setProperty("java.awt.headless", "false")

	val loading = LoadingWindow()
	loading.show()

	val context = try {

		runApplication<AplikasiCetakStikerApplication>(*args)

	} catch (e: Throwable) {

		loading.close()

		e.printStackTrace()

		val rootCause = getRootCause(e)

		JOptionPane.showMessageDialog(
			null,
			"""
            Aplikasi gagal dijalankan.

            ${rootCause.javaClass.name}
            
            ${rootCause.message ?: "Tidak ada pesan error."}
            """.trimIndent(),
			"Gagal Menjalankan Aplikasi",
			JOptionPane.ERROR_MESSAGE
		)

		return
	}

	// Spring Boot benar-benar berhasil
	loading.close()

	println()
	println("========================================")
	println(" APLIKASI CETAK STIKER BERHASIL START")
	println("========================================")
	println("URL : http://localhost:8080")
	println()

	// System Tray tidak boleh membuat aplikasi dianggap gagal
	try {

		val appPathProvider =
			context.getBean(AppPathProvider::class.java)

		initSystemTray(appPathProvider)

	} catch (e: Throwable) {

		println("Gagal membuat System Tray:")
		e.printStackTrace()
	}
}
private fun getRootCause(
	throwable: Throwable
): Throwable {

	var cause = throwable

	while (cause.cause != null) {
		cause = cause.cause!!
	}

	return cause
}
private fun initSystemTray(
	appPathProvider: AppPathProvider
) {

	println("OS      : ${System.getProperty("os.name")}")
	println("Headless: ${GraphicsEnvironment.isHeadless()}")
	println("Tray    : ${SystemTray.isSupported()}")

	if (!SystemTray.isSupported()) {
		println("System Tray tidak didukung")
		return
	}

	val tray = SystemTray.getSystemTray()

	val image = try {
		ImageIO.read(
			AplikasiCetakStikerApplication::class.java
				.getResourceAsStream("/static/assets/images/Logo 256x256.ico")
		)
	} catch (e: Exception) {
		BufferedImage(16, 16, BufferedImage.TYPE_INT_ARGB)
	}

	val popup = PopupMenu()

	val judulAplikasi = MenuItem("Aplikasi Cetak Stiker")

	val bukaAplikasi = MenuItem("Buka Aplikasi")
	bukaAplikasi.addActionListener {
		Desktop.getDesktop().browse(
			URI("http://localhost:8080")
		)
	}

	val bukaData = MenuItem("Buka Folder Data")
	bukaData.addActionListener {
		Desktop.getDesktop().open(
			appPathProvider.dataDir()
		)
	}

	val bukaUploads = MenuItem("Buka Uploads")
	bukaUploads.addActionListener {
		Desktop.getDesktop().open(
			appPathProvider.uploadsDir()
		)
	}

	val bukaDatabase = MenuItem("Buka Database")
	bukaDatabase.addActionListener {
		Desktop.getDesktop().open(
			appPathProvider.databaseDir()
		)
	}

	val keluar = MenuItem("Keluar")
	keluar.addActionListener {
		tray.remove(tray.trayIcons.first())
		System.exit(0)
	}

	popup.add(judulAplikasi)
	popup.addSeparator()
	popup.add(bukaAplikasi)
	popup.add(bukaData)
	popup.add(bukaUploads)
	popup.add(bukaDatabase)
	popup.addSeparator()
	popup.add(keluar)

	val trayIcon = TrayIcon(image, "Aplikasi Cetak Stiker", popup)

	trayIcon.isImageAutoSize = true

	tray.add(trayIcon)

	trayIcon.displayMessage(
		"Aplikasi Cetak Stiker",
		"Server berhasil dijalankan",
		TrayIcon.MessageType.INFO
	)
}