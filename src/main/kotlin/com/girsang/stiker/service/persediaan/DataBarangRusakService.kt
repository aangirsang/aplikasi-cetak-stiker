package com.girsang.stiker.service.persediaan

import com.girsang.stiker.config.JenisRiwayatStok
import com.girsang.stiker.model.dto.request.BarangRusakRequest
import com.girsang.stiker.model.dto.response.BarangRusakResponse
import com.girsang.stiker.model.entity.DataBarangRusak
import com.girsang.stiker.model.mapper.DataBarangMapper
import com.girsang.stiker.repository.DataBarangRepository
import com.girsang.stiker.repository.DataBarangRusakRepository
import com.girsang.stiker.repository.DataPenggunaRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional
class DataBarangRusakService(
    private val repoBarangRusak: DataBarangRusakRepository,
    private val repoBarang: DataBarangRepository,
    private val repoPengguna: DataPenggunaRepository,
    private val mapper: DataBarangMapper,
    private val stokService: StokService
) {

    @Transactional(readOnly = true)
    fun semuaBarangRusak(): List<BarangRusakResponse> =
        repoBarangRusak.findAll().map { mapper.toResponse(it) }

    @Transactional(readOnly = true)
    fun cariId(id: String): BarangRusakResponse {
        val entity = repoBarangRusak.findById(id)
            .orElseThrow { throw IllegalArgumentException("ID $id tidak ditemukan!!") }

        return mapper.toResponse(entity)
    }

    fun simpanBarangRusak(request: BarangRusakRequest): BarangRusakResponse {
        val pengguna = repoPengguna.findById(request.idPengguna)
            .orElseThrow { IllegalArgumentException("Data Pengguna dengan ID ${request.idPengguna} tidak ditemukan!!") }

        val barang = repoBarang.findById(request.idBarang)
            .orElseThrow { IllegalArgumentException("Data barang dengan ID ${request.idBarang} tidak ditemukan!!") }

        val barangRusak = DataBarangRusak(
            dataPengguna = pengguna,
            dataBarang = barang,
            tanggal = System.currentTimeMillis(),
            jumlah = request.jumlah,
            catatan = request.catatan,
            pathGambar = request.pathGambar
        )

        val simpan = repoBarangRusak.save(barangRusak)

        stokService.kurangiStok(
            barangId = request.idBarang,
            jumlah = request.jumlah,
            jenis = JenisRiwayatStok.BARANG_RUSAK,
            referensiId = simpan.id,
            pengguna = pengguna,
            keterangan = "Barang Rusak"
        )

        return mapper.toResponse(simpan)
    }

    fun ubahBarangRusak(id: String, request: BarangRusakRequest): BarangRusakResponse {
        val dataLama = repoBarangRusak.findById(id)
            .orElseThrow { IllegalArgumentException("Data barang dengan ID $id tidak ditemukan!!") }

        val pengguna = repoPengguna.findById(request.idPengguna)
            .orElseThrow { IllegalArgumentException("Data Pengguna dengan ID ${request.idPengguna} tidak ditemukan!!") }

        val barang = repoBarang.findById(request.idBarang)
            .orElseThrow { IllegalArgumentException("Data barang dengan ID ${request.idBarang} tidak ditemukan!!") }

        dataLama.apply {
            dataPengguna = pengguna
            dataBarang = barang
            tanggal = System.currentTimeMillis()
            jumlah = request.jumlah
            catatan = request.catatan
            pathGambar = request.pathGambar
        }

        val simpan = repoBarangRusak.save(dataLama)

        stokService.ubahStok(
            referensiId = simpan.id,
            barangId = request.idBarang,
            jumlahBaru = -request.jumlah,
            pengguna = pengguna,
            keterangan = "Edit Barang Rusak"
        )

        return mapper.toResponse(simpan)
    }

    fun hapusBarangRusak(id: String) {
        val dataLama = repoBarangRusak.findById(id)
            .orElseThrow { IllegalArgumentException("Data barang dengan ID $id tidak ditemukan!!") }

        stokService.hapusStok(
            referensiId = dataLama.id,
            barangId = dataLama.dataBarang.id,
        )

        repoBarangRusak.deleteById(id)
    }

}