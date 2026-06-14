package com.girsang.stiker.controller

import com.girsang.stiker.model.dto.UploadResponse
import com.girsang.stiker.service.UploadService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/api/upload")
class UploadController(
    private val uploadService: UploadService
) {

    @PostMapping("/gambar")
    fun uploadGambar(
        @RequestParam("files")
        files: List<MultipartFile>
    ): ResponseEntity<List<UploadResponse>> {

        val result =
            uploadService.uploadGambar(files)

        return ResponseEntity.ok(result)
    }
}