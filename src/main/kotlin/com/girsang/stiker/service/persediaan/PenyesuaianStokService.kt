package com.girsang.stiker.service.persediaan

import com.girsang.stiker.config.JenisRiwayatStok
import com.girsang.stiker.model.dto.request.PenyesuaianStokRequest
import com.girsang.stiker.model.dto.response.PenyesuaianStokResponse
import com.girsang.stiker.model.entity.DataPenyesuaianStok
import com.girsang.stiker.model.mapper.DataBarangMapper
import com.girsang.stiker.repository.DataBarangRepository
import com.girsang.stiker.repository.DataPenggunaRepository
import com.girsang.stiker.repository.PenyesuaianStokRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional
class PenyesuaianStokService(
    private val repoPenyesuaian: PenyesuaianStokRepository,
    private val repoBarang: DataBarangRepository,
    private val repoPengguna: DataPenggunaRepository,
    private val mapper: DataBarangMapper,
    private val stokService: StokService
) {
    @Transactional(readOnly = true)
    fun semuaPenyesuaian(): List<PenyesuaianStokResponse> =
        repoPenyesuaian.findAll().map { mapper.toResponse(it) }

    @Transactional(readOnly = true)
    fun cariId(id: String): PenyesuaianStokResponse {
        val entity = repoPenyesuaian.findById(id)
            .orElseThrow { throw IllegalArgumentException("Data ID $id tidak ditemukan!!") }

        return mapper.toResponse(entity)
    }

    fun simpanData(request: PenyesuaianStokRequest): PenyesuaianStokResponse {
        val barang = repoBarang.findById(request.dataBarangId)
            .orElseThrow { throw IllegalArgumentException("Data ID ${request.dataBarangId} tidak ditemukan!!") }

        val pengguna = repoPengguna.findById(request.dataPenggunaId)
            .orElseThrow { throw IllegalArgumentException("Data ID ${request.dataPenggunaId} tidak ditemukan!!") }

        val penyesuaian = DataPenyesuaianStok(
            dataBarang = barang,
            dataPengguna = pengguna,
            tanggal = System.currentTimeMillis(),
            stokSistem = request.stokSistem,
            stokFisik = request.stokFisik,
            selisih = request.selisih,
            pathGambar = request.pathGambar,
            alasan = request.alasan

        )

        val simpanData = repoPenyesuaian.save(penyesuaian)

        stokService.tambahStok(
            barangId = simpanData.dataBarang.id,
            jumlah = simpanData.selisih,
            jenis = JenisRiwayatStok.PENYESUAIAN,
            referensiId = simpanData.id,
            pengguna = pengguna,
            keterangan = "Penyesuaian Stok"
        )

        return mapper.toResponse(simpanData)
    }

    fun ubahData(id: String, request: PenyesuaianStokRequest): PenyesuaianStokResponse {
        val dataLama = repoPenyesuaian.findById(id)
            .orElseThrow { throw IllegalArgumentException("Data ID ${request.dataPenggunaId} tidak ditemukan!!") }

        val barang = repoBarang.findById(request.dataBarangId)
            .orElseThrow { throw IllegalArgumentException("Data ID ${request.dataBarangId} tidak ditemukan!!") }

        val pengguna = repoPengguna.findById(request.dataPenggunaId)
            .orElseThrow { throw IllegalArgumentException("Data ID ${request.dataPenggunaId} tidak ditemukan!!") }

        dataLama.apply {
            dataLama.dataBarang = barang
            dataLama.stokSistem = request.stokSistem
            dataLama.stokFisik = request.stokFisik
            dataLama.selisih = request.selisih
            dataLama.pathGambar = request.pathGambar
            dataLama.alasan = request.alasan
        }

        val simpanData = repoPenyesuaian.save(dataLama)

        stokService.ubahStok(
            referensiId = dataLama.id,
            barangId = dataLama.dataBarang.id,
            jumlahBaru = dataLama.selisih,
            pengguna = pengguna,
            keterangan = "Edit Pembelian"
        )

        return mapper.toResponse(simpanData)

    }

    fun hapusData(id: String) {
        val dataLama = repoPenyesuaian.findById(id)
            .orElseThrow { throw IllegalArgumentException("Data ID $id tidak ditemukan!!") }

        stokService.hapusStok(
            referensiId = dataLama.id,
            barangId = dataLama.dataBarang.id
        )

        repoPenyesuaian.deleteById(id)
    }
}