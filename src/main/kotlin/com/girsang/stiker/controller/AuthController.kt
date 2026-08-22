package com.girsang.stiker.controller

import com.girsang.stiker.model.dto.request.LoginRequest
import com.girsang.stiker.repository.DataPenggunaRepository
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import jakarta.servlet.http.HttpSession
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.AuthenticationException
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler
import org.springframework.security.web.context.HttpSessionSecurityContextRepository
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val authenticationManager: AuthenticationManager,
    private val repoPengguna: DataPenggunaRepository
) {

    @PostMapping("/login")
    fun login(
        @RequestBody request: LoginRequest,
        session: HttpSession
    ): ResponseEntity<Any> {

        return try {

            val authentication =
                authenticationManager.authenticate(
                    UsernamePasswordAuthenticationToken(
                        request.namaPengguna,
                        request.kataSandi
                    )
                )

            val context =
                SecurityContextHolder.createEmptyContext()

            context.authentication = authentication

            SecurityContextHolder.setContext(context)

            session.setAttribute(
                HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                context
            )

            ResponseEntity.ok(
                mapOf(
                    "success" to true,
                    "message" to "Login berhasil"
                )
            )

        } catch (e: AuthenticationException) {

            SecurityContextHolder.clearContext()

            ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(
                    mapOf(
                        "success" to false,
                        "message" to "Username atau password salah"
                    )
                )
        }
    }

    @GetMapping("/me")
    fun me(
        authentication: Authentication
    ): ResponseEntity<Any> {

        val pengguna =
            repoPengguna
                .findByNamaPengguna(
                    authentication.name
                )
                ?: return ResponseEntity.notFound().build()

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

    @PostMapping("/logout")
    fun logout(
        request: HttpServletRequest,
        response: HttpServletResponse
    ): ResponseEntity<Any> {

        SecurityContextLogoutHandler()
            .logout(
                request,
                response,
                SecurityContextHolder.getContext().authentication
            )

        return ResponseEntity.ok().build()
    }

    @GetMapping("/check")
    fun check(
        authentication: Authentication?
    ): String {

        return if (
            authentication != null &&
            authentication.isAuthenticated &&
            authentication.principal != "anonymousUser"
        ) {
            "LOGIN"
        } else {
            "BELUM LOGIN"
        }
    }
}