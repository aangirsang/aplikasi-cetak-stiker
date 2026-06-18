package com.girsang.stiker.controller


import com.girsang.stiker.model.dto.DataPenggunaCreateRequest
import com.girsang.stiker.model.dto.DataPenggunaUpdateRequest
import com.girsang.stiker.model.entity.DataPengguna
import com.girsang.stiker.service.DataPenggunaService
import jakarta.servlet.http.HttpSession
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/data-pengguna")
class DataPenggunaController(private val service: DataPenggunaService) {

    @GetMapping
    fun semuaPengguna(): ResponseEntity<List<DataPengguna>>{
    return ResponseEntity.ok(service.semuaPengguna())
    }

    @GetMapping("/{id}")
    fun cariID(@PathVariable id: Long): ResponseEntity<DataPengguna> {
        return service.cariID(id)
            .map { ResponseEntity.ok(it) }
            .orElse(ResponseEntity.notFound().build())
    }

    @PostMapping("/login")
    fun login(
        @RequestParam username: String,
        @RequestParam password: String,
        session: HttpSession
    ): ResponseEntity<Any> {

        val pengguna =
            service.login(
                username,
                password
            )
                ?: return ResponseEntity
                    .badRequest()
                    .body("Username atau password salah")

        session.setAttribute(
            "LOGIN_USER",
            pengguna
        )

        return ResponseEntity.ok(
            mapOf(
                "success" to true,
                "nama" to pengguna.namaLengkap
            )
        )
    }

    @PostMapping
    fun simpan(
        @Valid
        @RequestBody
        request: DataPenggunaCreateRequest
    ): ResponseEntity<Any> {

        return try {
            val save = service.simpan(request)
            ResponseEntity.ok(save)

        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(400)
                .body(mapOf("message" to e.message))
        }
    }

    @PutMapping("/{id}")
    fun update(
        @PathVariable id: Long,
        @Valid @RequestBody request: DataPenggunaUpdateRequest
    ): ResponseEntity<Any> {

        return try {
            val update = service.update(id, request)
            ResponseEntity.ok(update)

        } catch (_: NoSuchElementException) {
            ResponseEntity.status(404)
                .body(mapOf("message" to "Pengguna tidak ditemukan"))

        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(400)
                .body(mapOf("message" to e.message))
        }
    }

    @DeleteMapping("/{id}")
    fun hapus(@PathVariable id: Long): ResponseEntity<Map<String, String>> {
        return try {
            service.hapus(id)
            ResponseEntity.ok(mapOf("message" to "Data pengguna Berhasil Dihapus"))
        } catch (_: NoSuchElementException){
            ResponseEntity.status(404).body(mapOf("message" to "Pengguna Tidak Ditemukan"))
        }
    }

    @GetMapping("/ping")
    fun ping(): ResponseEntity<Map<String, String>>{
    return ResponseEntity.ok(mapOf("Status Server " to "Terhubung"))
    }
}