package com.girsang.stiker.controller

import com.girsang.stiker.model.dto.request.PembelianRequest
import com.girsang.stiker.model.dto.response.PembelianResponse
import com.girsang.stiker.model.dto.response.PembelianRinciResponse
import com.girsang.stiker.service.persediaan.DataPembelianService
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
@RequestMapping("/api/data-pembelian")
class DataPembelianController (
    private val pembelianService: DataPembelianService
){
    @GetMapping
    fun semua(): ResponseEntity<List<PembelianResponse>> =
        ResponseEntity.ok(pembelianService.semuaDataPembelian())

    @GetMapping("/rincian")
    fun rincian(): ResponseEntity<List<PembelianRinciResponse>> =
        ResponseEntity.ok(pembelianService.semuaRinci())

    @GetMapping("/{id}")
    fun cariId(
        @PathVariable id: String
    ): ResponseEntity<PembelianResponse> =
        ResponseEntity.ok(pembelianService.cariId(id))

    @PostMapping
    fun simpan(
        @RequestBody request: PembelianRequest
    ): ResponseEntity<PembelianResponse> =
        ResponseEntity.status(HttpStatus.CREATED)
            .body(pembelianService.simpan(request))

    @PutMapping("/{id}")
    fun ubah(
        @PathVariable id: String,
        @RequestBody request: PembelianRequest
    ): ResponseEntity<PembelianResponse> =
        ResponseEntity.ok(
            pembelianService.ubah(id, request)
        )

    @DeleteMapping("/{id}")
    fun hapus(
        @PathVariable id: String
    ): ResponseEntity<Void> {
        pembelianService.hapus(id)
        return ResponseEntity.noContent().build()
    }
}