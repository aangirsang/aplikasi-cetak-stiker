package com.girsang.stiker.exception

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

@RestControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidation(
        ex: MethodArgumentNotValidException
    ): ResponseEntity<Map<String, String>> {

        val pesan = ex.bindingResult
            .fieldErrors
            .firstOrNull()
            ?.defaultMessage
            ?: "Input tidak valid"

        return ResponseEntity.badRequest().body(
            mapOf("message" to pesan)
        )
    }
}