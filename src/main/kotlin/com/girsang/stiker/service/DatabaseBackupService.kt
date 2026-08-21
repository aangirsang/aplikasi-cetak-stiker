package com.girsang.stiker.service

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.io.File
import java.nio.file.Files
import java.nio.file.StandardCopyOption
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@Service
class DatabaseBackupService(

    @Value("\${spring.datasource.url}")
    private val datasourceUrl: String,

    @Value("\${app.data.dir}")
    private val dataDir: String

) {

    private val logger = LoggerFactory.getLogger(javaClass)

    fun backup() {

        try {

            val databaseFile = getDatabaseFile()

            if (!databaseFile.exists()) {
                logger.warn("Database tidak ditemukan: {}", databaseFile.absolutePath)
                return
            }

            if (databaseFile.length() == 0L) {
                logger.warn("Database kosong, backup dilewati")
                return
            }

            val timestamp = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss"))

            val backupRoot = File("$dataDir/backup")
            val backupDir = File(backupRoot, timestamp)

            backupDir.mkdirs()

            // Backup timestamp
            Files.copy(
                databaseFile.toPath(),
                File(backupDir, databaseFile.name).toPath(),
                StandardCopyOption.REPLACE_EXISTING
            )

            // Backup latest
            val latestDir = File(backupRoot, "latest")

            if (latestDir.exists()) {
                latestDir.deleteRecursively()
            }

            latestDir.mkdirs()

            Files.copy(
                databaseFile.toPath(),
                File(latestDir, databaseFile.name).toPath(),
                StandardCopyOption.REPLACE_EXISTING
            )

            cleanupOldBackups(backupRoot)

            logger.info(
                "Backup database berhasil: {}",
                backupDir.absolutePath
            )

        } catch (e: Exception) {
            logger.error("Gagal melakukan backup database", e)
        }
    }

    private fun getDatabaseFile(): File {

        val path = datasourceUrl
            .removePrefix("jdbc:sqlite:")
            .replace("\\", "/")

        return File(path)
    }

    private fun cleanupOldBackups(backupRoot: File) {

        val backups = backupRoot.listFiles()
            ?.filter {
                it.isDirectory && it.name != "latest"
            }
            ?.sortedByDescending { it.name }
            ?: return

        backups
            .drop(5)
            .forEach {

                logger.info(
                    "Menghapus backup lama: {}",
                    it.absolutePath
                )

                it.deleteRecursively()
            }
    }
}