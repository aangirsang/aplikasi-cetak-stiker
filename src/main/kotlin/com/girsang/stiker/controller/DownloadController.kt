package com.girsang.stiker.controller

import com.girsang.stiker.config.AppPathProvider
import jakarta.servlet.http.HttpServletRequest
import org.springframework.core.io.UrlResource
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.nio.file.Files

@RestController
@RequestMapping("/api/download")
class DownloadController(

    private val pathProvider: AppPathProvider

) {

    @GetMapping("/cdr/{fileName:.+}")
    fun downloadCdr(

        @PathVariable
        fileName: String,

        request: HttpServletRequest

    ): ResponseEntity<UrlResource> {

        val path =
            pathProvider
                .uploadCdrDir()
                .toPath()
                .resolve(fileName)

        if (!Files.exists(path)) {

            return ResponseEntity
                .notFound()
                .build()

        }

        val size =
            Files.size(path)

        val lastModified =
            Files.getLastModifiedTime(path)
                .toMillis()

        val etag =
            "\"${fileName}_${size}_$lastModified\""

        val clientEtag =
            request.getHeader(
                HttpHeaders.IF_NONE_MATCH
            )

        if (etag == clientEtag) {

            return ResponseEntity
                .status(HttpStatus.NOT_MODIFIED)
                .eTag(etag)
                .build()

        }

        val resource =
            UrlResource(path.toUri())

        return ResponseEntity.ok()

            .contentLength(size)

            .contentType(
                MediaType.APPLICATION_OCTET_STREAM
            )

            .lastModified(lastModified)

            .eTag(etag)

            .body(resource)

    }

}