package com.girsang.stiker.controller

import com.girsang.stiker.model.dto.request.DataOrderanRequest
import com.girsang.stiker.model.dto.response.DataOrderanResponse
import com.girsang.stiker.model.dto.response.DataOrderanRinciResponse
import com.girsang.stiker.model.dto.response.PembelianResponse
import com.girsang.stiker.service.orderan.DataOrderanService
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
@RequestMapping("/api/data-orderan")
class DataOrderanController(
    private val serviceOrder: DataOrderanService
) {
    @GetMapping
    fun semuaData(): ResponseEntity<List<DataOrderanResponse>> =
        ResponseEntity.ok(serviceOrder.semuaOrderan())

    @GetMapping("/rincian")
    fun semuaRincian(): ResponseEntity<List<DataOrderanRinciResponse>> =
        ResponseEntity.ok(serviceOrder.semuaRinci())

    @GetMapping("/{id}")
    fun cariId(
        @PathVariable id: String
    ): ResponseEntity<DataOrderanResponse> =
        ResponseEntity.ok(serviceOrder.cariId(id))

    @PostMapping
    fun simpanData(
        @RequestBody request: DataOrderanRequest
    ): ResponseEntity<DataOrderanResponse> =
        ResponseEntity.status(HttpStatus.CREATED)
            .body(serviceOrder.simpan(request))

    @PutMapping("/{id}")
    fun ubahData(
        @PathVariable id: String,
        @RequestBody request: DataOrderanRequest
    ): ResponseEntity<DataOrderanResponse> =
        ResponseEntity.ok(serviceOrder.ubah(id, request))

    @DeleteMapping("/{id}")
    fun hapusData(
        @PathVariable id: String
    ): ResponseEntity<Void> {
        serviceOrder.hapus(id)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/faktur")
    fun generateFaktur(): Map<String, String> {
        return mapOf(
            "faktur" to serviceOrder.generateFaktur()
        )
    }
}