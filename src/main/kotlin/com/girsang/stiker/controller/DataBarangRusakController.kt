package com.girsang.stiker.controller

import com.girsang.stiker.model.dto.request.BarangRusakRequest
import com.girsang.stiker.model.dto.response.BarangRusakResponse
import com.girsang.stiker.service.persediaan.DataBarangRusakService
import org.springframework.http.HttpStatus
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
    @RequestMapping("/api/data-barang-rusak")
class DataBarangRusakController(
    val serviceBarangRusak: DataBarangRusakService
) {

    @GetMapping
    fun semuaBarangRusak(): ResponseEntity<List<BarangRusakResponse>> =
        ResponseEntity.ok(serviceBarangRusak.semuaBarangRusak())

    @GetMapping("/{id}")
    fun cariId(
        @PathVariable id: String
    ): ResponseEntity<BarangRusakResponse> =
        ResponseEntity.ok(serviceBarangRusak.cariId(id))

    @PostMapping
    fun simpanBarangRusak(
        @RequestBody request: BarangRusakRequest
    ): ResponseEntity<BarangRusakResponse> =
        ResponseEntity.status(HttpStatus.CREATED).body(serviceBarangRusak.simpanBarangRusak(request))

    @PutMapping("/{id}")
    fun ubahBarangRusak(
        @PathVariable id: String,
        @RequestBody request: BarangRusakRequest
    ): ResponseEntity<BarangRusakResponse> =
        ResponseEntity.ok(serviceBarangRusak.ubahBarangRusak(id, request))

    @DeleteMapping("/{id}")
    fun hapusBarangRusak(
        @PathVariable id: String
    ): ResponseEntity<Void> {
        serviceBarangRusak.hapusBarangRusak(id)
        return ResponseEntity.noContent().build()
    }
}