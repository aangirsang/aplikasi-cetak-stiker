package com.girsang.stiker.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.io.File

@Component
class AppPathProvider(

    @Value("\${app.data.dir}")
    private val dataDir: String

) {

    fun uploadsDir(): File =
        File(dataDir, "uploads")

    // ===========================
    // GAMBAR
    // ===========================

    fun uploadImageDir(): File =
        File(uploadsDir(), "gambar")

    fun uploadImageUrl(fileName: String): String =
        "/uploads/gambar/$fileName"

    // ===========================
    // CDR
    // ===========================

    fun uploadCdrDir(): File =
        File(uploadsDir(), "cdr")

    fun uploadCdrUrl(fileName: String): String =
        "/uploads/cdr/$fileName"

    // ===========================
    // DATABASE
    // ===========================

    fun databaseDir(): File =
        File(dataDir, "database")

    fun databaseFile(): File =
        File(databaseDir(), "cetak-stiker.db")
}