package com.girsang.stiker.controller

import com.girsang.stiker.model.entity.DataLevel
import com.girsang.stiker.service.master.DataLevelService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*


@RestController
@RequestMapping("/api/data-level")
class DataLevelController(
    private val service: DataLevelService
) {

    @GetMapping
    fun semuaLevel(): ResponseEntity<List<DataLevel>> =
        ResponseEntity.ok(service.semuaLevel())

    @GetMapping("/{id}")
    fun cariId(@PathVariable id: String): ResponseEntity<DataLevel> =
        ResponseEntity.ok(service.cariId(id))


    @PostMapping
    fun simpan(@Valid @RequestBody dataLevel: DataLevel): ResponseEntity<Any> {
        return try {
            val simpan = service.simpan(dataLevel)
            ResponseEntity.ok(simpan)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(400)
                .body(mapOf("message" to e.message))
        }
    }

    @PutMapping("/{id}")
    fun delete(@PathVariable id: String, @RequestBody dataLevel: DataLevel): ResponseEntity<Any> {
        return try {
            val update = service.update(id, dataLevel)
            ResponseEntity.ok(update)
        } catch (_: NoSuchElementException) {
            ResponseEntity.status(404).body(mapOf("message" to " Level Tidak Ditemukan"))
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