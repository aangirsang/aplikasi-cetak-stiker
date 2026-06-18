package com.girsang.stiker.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.io.File

@Component
class AppPathProvider(

    @Value("\${app.data.dir}")
    private val dataDir: String

) {

    fun uploadDir(): File =
        File(dataDir, "uploads/gambar")

    fun databaseDir(): File =
        File(dataDir, "database")

    fun databaseFile(): File =
        File(databaseDir(), "cetak-stiker.db")

    fun uploadUrl(fileName: String): String =
        "/uploads/gambar/$fileName"
}