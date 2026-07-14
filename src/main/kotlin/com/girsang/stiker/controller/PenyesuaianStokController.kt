package com.girsang.stiker.controller

import com.girsang.stiker.model.dto.request.PenyesuaianStokRequest
import com.girsang.stiker.model.dto.response.PenyesuaianStokResponse
import com.girsang.stiker.service.PenyesuaianStokService
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
@RequestMapping("/api/penyesuaian-stok")
class PenyesuaianStokController(
    private val servicePenyesuaian: PenyesuaianStokService
) {
    @GetMapping
    fun semuaData(): ResponseEntity<List<PenyesuaianStokResponse>> =
        ResponseEntity.ok(servicePenyesuaian.semuaPenyesuaian())

    @GetMapping("/{id}")
    fun cariId(
        @PathVariable id: String
    ): ResponseEntity<PenyesuaianStokResponse> =
        ResponseEntity.ok(servicePenyesuaian.cariId(id))

    @PostMapping
    fun simpanData(
        @RequestBody request: PenyesuaianStokRequest
    ): ResponseEntity<PenyesuaianStokResponse> =
        ResponseEntity.status(HttpStatus.CREATED).body(servicePenyesuaian.simpanData(request))

    @PutMapping("/{id}")
    fun ubahData(
        @PathVariable id: String,
        @RequestBody request: PenyesuaianStokRequest
    ): ResponseEntity<PenyesuaianStokResponse> =
        ResponseEntity.ok(servicePenyesuaian.ubahData(id, request))

    @DeleteMapping("/{id}")
    fun hapusData(
        @PathVariable id: String
    ): ResponseEntity<Void> {
        servicePenyesuaian.hapusData(id)
        return ResponseEntity.noContent().build()
    }
}