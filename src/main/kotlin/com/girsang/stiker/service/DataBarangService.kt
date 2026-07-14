package com.girsang.stiker.service

import com.girsang.stiker.model.mapper.DataBarangMapper
import com.girsang.stiker.model.dto.response.RiwayatStokResponse
import com.girsang.stiker.model.entity.DataBarang
import com.girsang.stiker.repository.DataBarangRepository
import com.girsang.stiker.repository.DataRiwayatStokRepository
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.RequestBody
import kotlin.collections.component1
import kotlin.collections.component2

@Service
@Transactional
class DataBarangService(
    private val dataBarangRepository: DataBarangRepository,
    private val repoRiwayat: DataRiwayatStokRepository,
    private val mapper: DataBarangMapper,
    private val deletionService: EntityDeletionService
) {

    @Transactional(readOnly = true)
    fun semuaBarang(): List<DataBarang> = dataBarangRepository.findAll()

    @Transactional(readOnly = true)
    fun cariIdBarang(id: String): DataBarang {
        val dataBarang = dataBarangRepository.findById(id).orElseThrow {
            NoSuchElementException ("Data Barang dengan ID $id tidak ditemukan!!")
        }
        return dataBarang
    }

    fun simpanDataBarang(@RequestBody dataBarang: DataBarang): ResponseEntity<DataBarang> {
        if(dataBarangRepository.existsByNamaBarangIgnoreCase(dataBarang.namaBarang)){
            throw IllegalArgumentException("Data Barang ${dataBarang.namaBarang} sudah ada!!")
        }
        val dataBarang = DataBarang(
            namaBarang = dataBarang.namaBarang,
            stokBarang = dataBarang.stokBarang
        )
        val simpanDataBarang = dataBarangRepository.save(dataBarang)
        return ResponseEntity.ok(simpanDataBarang)
    }

    fun updateDataBarang(id: String, @RequestBody dataBarang: DataBarang): ResponseEntity<DataBarang> {
        val dataLama = dataBarangRepository.findById(id).orElseThrow() {
            throw IllegalArgumentException("Data Barang dengan ID ${dataBarang.id} tidak ditemukan!!")
        }
        if(dataBarangRepository.existsByNamaBarangIgnoreCaseAndIdNot(dataBarang.namaBarang, id)) {
            throw IllegalArgumentException("Data Barang ${dataBarang.namaBarang} sudah ada!!")
        }

        dataLama.apply {
            dataLama.namaBarang = dataBarang.namaBarang
            dataLama.stokBarang = dataBarang.stokBarang
        }
        val updatedDataBarang = dataBarangRepository.save(dataLama)
        return ResponseEntity.ok(updatedDataBarang)
    }
    fun hapusDataBarang(id: String) {
        if (!dataBarangRepository.existsById(id)) throw NoSuchElementException("Data Barang dengan ID ${id} tidak ditemukan!!")
        deletionService.safeDelete(DataBarang::class.java, id)
    }

    // RIWAYAT STOK
    @Transactional(readOnly = true)
    fun semuaRiwayat(): List<RiwayatStokResponse> =
        repoRiwayat.findAllByOrderByTanggalDesc().map { mapper.toResponse(it) }

    @Transactional(readOnly = true)
    fun semuaRiwayatTerakhir(): List<RiwayatStokResponse> {

        return repoRiwayat.findAll()
            .groupBy { it.referensiId to it.dataBarang.id }
            .mapNotNull { (_, list) ->
                list.maxByOrNull { it.tanggal }
            }
            .sortedByDescending { it.tanggal }
            .map(mapper::toResponse)
    }

    @Transactional(readOnly = true)
    fun riwayatBarang(barangId: String): List<RiwayatStokResponse> {
        return repoRiwayat
            .findByDataBarangId(barangId)
            .map { mapper.toResponse(it) }
    }
}