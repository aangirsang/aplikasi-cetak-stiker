package com.girsang.stiker.controller

import com.girsang.stiker.model.dto.request.LoginRequest
import com.girsang.stiker.service.DataPenggunaService
import jakarta.servlet.http.HttpSession
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val dataPenggunaService: DataPenggunaService
) {

    @PostMapping("/login")
    fun login(
        @RequestBody request: LoginRequest,
        session: HttpSession
    ): ResponseEntity<Any> {

        val pengguna =
            dataPenggunaService.login(
                request.namaPengguna,
                request.kataSandi
            )
                ?: return ResponseEntity.badRequest().body(
                    mapOf(
                        "success" to false,
                        "message" to "Username atau password salah"
                    )
                )

        session.setAttribute(
            "LOGIN_USER",
            pengguna.id
        )

        return ResponseEntity.ok(
            mapOf(
                "success" to true,
                "data" to mapOf(
                    "id" to pengguna.id,
                    "namaLengkap" to pengguna.namaLengkap,
                    "namaPengguna" to pengguna.namaPengguna,
                    "level" to pengguna.dataLevel.level,
                    "pathGambar" to pengguna.pathGambar
                )
            )
        )
    }
}