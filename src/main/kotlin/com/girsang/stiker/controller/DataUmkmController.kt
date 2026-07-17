package com.girsang.stiker.controller

import com.girsang.stiker.model.dto.request.DataUmkmRequest
import com.girsang.stiker.model.dto.response.DataUmkmResponse
import com.girsang.stiker.model.entity.DataUmkm
import com.girsang.stiker.service.umkm.DataUmkmService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/data-umkm")
class DataUmkmController(
    private val service: DataUmkmService
) {

    @GetMapping
    fun semua(): ResponseEntity<List<DataUmkmResponse>> =
        ResponseEntity.ok(service.semua())

    @GetMapping("/aktif")
    fun semuaAktif(): ResponseEntity<List<DataUmkmResponse>> =
        ResponseEntity.ok(service.semuaAktif())

    @GetMapping("/punya-stiker")
    fun semuaPunyaStiker(): ResponseEntity<List<DataUmkmResponse>> =
        ResponseEntity.ok(service.semuaPunyaStiker())

    @GetMapping("/{id}")
    fun cariById(@PathVariable id: String): ResponseEntity<DataUmkmResponse> =
        ResponseEntity.ok(service.cariById(id))

    @GetMapping("/cari")
    fun cariUMKM(
        @RequestParam(required = false) namaPemilik: String?,
        @RequestParam(required = false) namaUsaha: String?,
        @RequestParam(required = false) alamat: String?
    ): List<DataUmkm> {
        return service.cariUMKM(namaPemilik, namaUsaha, alamat)
    }

    @PostMapping
    fun simpan(@Valid @RequestBody dto: DataUmkmRequest): ResponseEntity<Any> =
        try {
            val simpan = service.simpan(dto)
            ResponseEntity.status(201).body(simpan)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().body(mapOf("message" to e.message))
        } catch (e: NoSuchElementException) {
            ResponseEntity.status(404).body(mapOf("message" to e.message))
        }

    @PutMapping("/{id}")
    fun ubah(@PathVariable id: String, @Valid @RequestBody dto: DataUmkmRequest): ResponseEntity<Any> =
        try {
            val simpan = service.ubah(id, dto)
            ResponseEntity.status(201).body(simpan)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().body(mapOf("message" to e.message))
        } catch (e: NoSuchElementException) {
            ResponseEntity.status(404).body(mapOf("message" to e.message))
        }

    @DeleteMapping("/{id}")
    fun hapus(@PathVariable id: String): ResponseEntity<Any> {
        return try {
            service.hapus(id)
            ResponseEntity.ok(mapOf("message" to "Data berhasil dihapus"))
        } catch (e: RuntimeException) {
            ResponseEntity.status(400).body(mapOf("error" to e.message))
        }
    }
}