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
    fun cariId(@PathVariable id: Long): ResponseEntity<DataKategori> {
        return service.cariId(id)
            .map { ResponseEntity.ok(it) }
            .orElse(ResponseEntity.notFound().build())
    }

    @PostMapping
    fun simpan(@Valid @RequestBody dataKategori: DataKategori): ResponseEntity<DataKategori> {
        val simpan = service.simpan(dataKategori)
        return ResponseEntity.status(201).body(simpan)
    }

    @PutMapping("/{id}")
    fun delete(@PathVariable id: Long, @RequestBody dataKategori: DataKategori): ResponseEntity<Any> {
        return try {
            val update = service.update(id, dataKategori)
            ResponseEntity.ok(update)
        } catch (e: NoSuchElementException) {
            ResponseEntity.status(404).body(mapOf("message" to " Kategori Tidak Ditemukan"))
        }
    }

    @DeleteMapping("/{id}")
    fun hapus(@PathVariable id: Long): ResponseEntity<Any> {
        return try {
            service.hapus(id)
            ResponseEntity.ok(mapOf("message" to "Data berhasil dihapus"))
        } catch (e: RuntimeException) {
            ResponseEntity.status(400).body(mapOf("error" to e.message))
        }
    }
}