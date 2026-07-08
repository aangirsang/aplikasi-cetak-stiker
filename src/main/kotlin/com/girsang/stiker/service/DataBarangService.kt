package com.girsang.stiker.service

import com.girsang.stiker.mapper.DataBarangMapper
import com.girsang.stiker.model.dto.response.RiwayatStokResponse
import com.girsang.stiker.model.entity.DataBarang
import com.girsang.stiker.repository.DataBarangRepository
import com.girsang.stiker.repository.DataRiwayatStokRepository
import jakarta.transaction.Transactional
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Service
import org.springframework.web.bind.annotation.RequestBody

@Service
@Transactional
class DataBarangService(
    private val dataBarangRepository: DataBarangRepository,
    private val repoRiwayat: DataRiwayatStokRepository,
    private val mapper: DataBarangMapper,
    private val deletionService: EntityDeletionService
) {

    fun semuaBarang(): List<DataBarang> = dataBarangRepository.findAll()
    fun cariIdBarang(id: Long): DataBarang {
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
    fun updateDataBarang(id: Long, @RequestBody dataBarang: DataBarang): ResponseEntity<DataBarang> {
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
    fun hapusDataBarang(id: Long) {
        if (!dataBarangRepository.existsById(id)) throw NoSuchElementException("Data Barang dengan ID ${id} tidak ditemukan!!")
        deletionService.safeDelete(DataBarang::class.java, id)
    }

    // RIWAYAT STOK
    @Transactional
    fun semuaRiwayat(): List<RiwayatStokResponse> =
        repoRiwayat.findAll().map { mapper.toResponse(it) }

    fun riwayatBarang(barangId: Long): List<RiwayatStokResponse> {
        return repoRiwayat
            .findByDataBarangId(barangId)
            .map { mapper.toResponse(it) }
    }
}