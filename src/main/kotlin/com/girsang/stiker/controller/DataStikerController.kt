package com.girsang.stiker.controller

import com.girsang.stiker.model.dto.request.DataStikerRequest
import com.girsang.stiker.model.dto.response.DataStikerResponse
import com.girsang.stiker.model.entity.DataStiker
import com.girsang.stiker.service.umkm.DataStikerService
import org.springframework.http.ResponseEntity
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/data-stiker")
@Validated
class DataStikerController(
    private val service: DataStikerService
) {

    @GetMapping
    fun semua(): ResponseEntity<List<DataStikerResponse>> =
        ResponseEntity.ok(service.semua())

    @GetMapping("/{id}")
    fun cariById(@PathVariable id: String): ResponseEntity<DataStikerResponse> =
        ResponseEntity.ok(service.cariById(id))

    @GetMapping("/umkm/{umkmId}")
    fun cariByUMKM(@PathVariable umkmId: String): ResponseEntity<List<DataStikerResponse>> =
        ResponseEntity.ok(service.cariByUMKM(umkmId))

    @GetMapping("/umkm-status-true/{umkmId}")
    fun cariByUmkmDanStatus(@PathVariable umkmId: String): ResponseEntity<List<DataStikerResponse>> =
        ResponseEntity.ok(service.cariByumkmDanStatus(umkmId))

    @PostMapping
    fun simpan(@RequestBody request: DataStikerRequest): ResponseEntity<DataStikerResponse> =
        ResponseEntity.ok(service.simpan(request))

    @PutMapping("/{id}")
    fun ubah(@PathVariable id: String, @RequestBody request: DataStikerRequest): ResponseEntity<DataStikerResponse> =
        ResponseEntity.ok(service.ubah(id, request))

    @DeleteMapping("/{id}")
    fun hapus(@PathVariable id: String) =
        ResponseEntity.ok(service.hapus(id))

    @GetMapping("/kode/{umkmId}")
    fun getKodeStiker(@PathVariable umkmId: String): ResponseEntity<Map<String, String>> {
        val kode = service.getKodeStikerBerikutnya(umkmId)
        return ResponseEntity.ok(mapOf("kodeStiker" to kode))
    }

    @GetMapping("/cari")
    fun search(
        @RequestParam(required = false) namaStiker: String?,
        @RequestParam(required = false) namaUsaha: String?
    ): List<DataStiker> {
        return service.cariStiker(namaStiker, namaUsaha)
    }
}