package com.girsang.stiker.controller

import com.girsang.stiker.model.entity.DataKategori
import com.girsang.stiker.service.DataKategoriService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*


@RestController
@RequestMapping("/api/data-kategori")
class DataKategoriController(private val service: DataKategoriService) {

    @GetMapping
    fun semuaLevel(): ResponseEntity<List<DataKategori>> =
        ResponseEntity.ok(service.semuaLevel())

    @GetMapping("/{id}")
    fun cariId(@PathVariable id: String): ResponseEntity<DataKategori> =
        ResponseEntity.ok(service.cariId(id))

    @PostMapping
    fun simpan(@Valid @RequestBody dataKategori: DataKategori): ResponseEntity<Any> {
        return try {
            val simpan = service.simpan(dataKategori)
            ResponseEntity.ok(simpan)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(400)
                .body(mapOf("message" to e.message))
        }
    }

    @PutMapping("/{id}")
    fun update(@PathVariable id: String, @RequestBody dataKategori: DataKategori): ResponseEntity<Any> {
        return try {
            val update = service.update(id, dataKategori)
            ResponseEntity.ok(update)
        } catch (_: NoSuchElementException) {
            ResponseEntity.status(404).body(mapOf("message" to " Kategori Tidak Ditemukan"))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(400)
                .body(mapOf("message" to e.message))
        }
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