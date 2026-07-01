package com.girsang.stiker.service

import com.girsang.stiker.config.AppPathProvider
import com.girsang.stiker.model.dto.UploadResponse
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.io.File
import java.util.UUID


@Service
class UploadService(
    private val pathProvider: AppPathProvider
) {

    fun uploadGambar(
        files: List<MultipartFile>
    ): List<UploadResponse> {

        val folder =
            pathProvider.uploadImageDir().canonicalFile

        if (!folder.exists()) {
            folder.mkdirs()
        }

        return files.map { file ->

            val fileName =
                "${UUID.randomUUID()}.webp"

            val destination =
                File(folder, fileName)

            file.transferTo(destination)

            UploadResponse(
                namaFile = fileName,
                path = pathProvider.uploadImageUrl(fileName)
            )
        }
    }

    fun uploadCdr(
        file: MultipartFile,
        fileName: String
    ): UploadResponse {

        val folder =
            pathProvider.uploadCdrDir().canonicalFile

        if (!folder.exists()) {
            folder.mkdirs()
        }

        val destination =
            File(folder, fileName)

        file.transferTo(destination)

        return UploadResponse(
            namaFile = fileName,
            path = pathProvider.uploadCdrUrl(fileName)
        )
    }
}