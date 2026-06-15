package com.girsang.stiker.service

import com.girsang.stiker.model.dto.UploadResponse
import net.coobird.thumbnailator.Thumbnails
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.awt.image.BufferedImage
import java.io.File
import java.util.*
import javax.imageio.ImageIO

@Service
class UploadService(

    @Value("\${app.upload.dir}")
    private val uploadDir: String

) {

    fun uploadGambar(
        files: List<MultipartFile>
    ): List<UploadResponse> {

        val folder = File(uploadDir)

        if(!folder.exists()){
            folder.mkdirs()
        }

        return files.map { file ->

            val fileName =
                "${UUID.randomUUID()}.webp"

            val destination =
                File(folder, fileName)

            convertToWebp(
                file,
                destination
            )

            UploadResponse(
                namaFile = fileName,
                path =
                    "/uploads/gambar/$fileName"
            )
        }
    }
}
private fun convertToWebp(
    file: MultipartFile,
    destination: File
) {

    val bufferedImage =
        ImageIO.read(
            file.inputStream
        )

    val imageWithAlpha =
        BufferedImage(
            bufferedImage.width,
            bufferedImage.height,
            BufferedImage.TYPE_INT_ARGB
        )

    val graphics =
        imageWithAlpha.createGraphics()

    graphics.drawImage(
        bufferedImage,
        0,
        0,
        null
    )

    graphics.dispose()

    Thumbnails.of(imageWithAlpha)
        .scale(1.0)
        .outputFormat("webp")
        .toFile(destination)
}