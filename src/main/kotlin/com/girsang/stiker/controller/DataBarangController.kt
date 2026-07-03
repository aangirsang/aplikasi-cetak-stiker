package com.girsang.stiker.controller

import com.girsang.stiker.model.entity.DataBarang
import com.girsang.stiker.service.DataBarangService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/data-barang")
class DataBarangController (
    private val dataBarangService: DataBarangService
){
    @GetMapping
    fun semuaDataBarang(): ResponseEntity<List<DataBarang>> =
        ResponseEntity.ok(dataBarangService.semuaBarang())

    @GetMapping("/{id}")
    fun cariIdBarang (@PathVariable id: Long): ResponseEntity<DataBarang> =
        ResponseEntity.ok(dataBarangService.cariIdBarang(id))

    @PostMapping
    fun simpanDataBarang(@Valid @RequestBody dataBarang: DataBarang): ResponseEntity<Any> =
        try {
            val simpanDataBarang = dataBarangService.simpanDataBarang(dataBarang)
            ResponseEntity.status(201).body(simpanDataBarang)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().body(mapOf("message" to e.message))
        } catch (e: NoSuchElementException) {
            ResponseEntity.status(404).body(mapOf("message" to e.message))
        }

    @PutMapping("/{id}")
    fun ubahDataBarang(@PathVariable id: Long, @Valid @RequestBody dataBarang: DataBarang): ResponseEntity<Any> =
    try {
        val updateDataBarang = dataBarangService.updateDataBarang(id, dataBarang)
        ResponseEntity.status(201).body(updateDataBarang)
    } catch (e: IllegalArgumentException) {
        ResponseEntity.badRequest().body(mapOf("message" to e.message))
    } catch (e: NoSuchElementException) {
        ResponseEntity.status(404).body(mapOf("message" to e.message))
    }

    @DeleteMapping("/{id}")
    fun hapusDataBarang(@PathVariable id: Long): ResponseEntity<Any> {
        return try {
            dataBarangService.hapusDataBarang(id)
            ResponseEntity.ok(mapOf("Data Barang" to "Data berhasil dihapus.."))
        } catch (e: RuntimeException) {
            ResponseEntity.status(400).body(mapOf("error" to e.message))
        }
    }
}