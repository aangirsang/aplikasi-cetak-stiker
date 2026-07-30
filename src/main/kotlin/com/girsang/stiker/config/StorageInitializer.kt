package com.girsang.stiker.config

import jakarta.annotation.PostConstruct
import org.springframework.stereotype.Component

@Component
class StorageInitializer(
    private val pathProvider: AppPathProvider
) {

    @PostConstruct
    fun init() {

        val uploadDir = pathProvider.uploadsDir()
        val uploadCdrDir = pathProvider.uploadCdrDir()
        val uploadTifDir = pathProvider.uploadTifDir()

        val databaseDir = pathProvider.databaseDir()
        val databaseFile = pathProvider.databaseFile()

        uploadDir.mkdirs()
        uploadCdrDir.mkdirs()
        uploadTifDir.mkdirs()
        databaseDir.mkdirs()

        if (!databaseFile.exists()) {
            databaseFile.createNewFile()
        }

        println("Upload Dir   : ${uploadDir.absolutePath}")
        println("Database Dir : ${databaseDir.absolutePath}")
        println("Database File: ${databaseFile.absolutePath}")
    }
}