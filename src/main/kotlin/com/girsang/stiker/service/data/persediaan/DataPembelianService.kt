package com.girsang.stiker.service.data.persediaan

import com.girsang.stiker.config.JenisRiwayatStok
import com.girsang.stiker.model.mapper.PembelianMapper
import com.girsang.stiker.model.dto.request.PembelianRequest
import com.girsang.stiker.model.dto.request.PembelianRinciRequest
import com.girsang.stiker.model.dto.response.PembelianResponse
import com.girsang.stiker.model.dto.response.PembelianRinciResponse
import com.girsang.stiker.model.entity.DataPembelian
import com.girsang.stiker.model.entity.DataPembelianRinci
import com.girsang.stiker.repository.DataBarangRepository
import com.girsang.stiker.repository.DataPenggunaRepository
import com.girsang.stiker.repository.DataPembelianRepository
import com.girsang.stiker.repository.DataPembelianRinciRepository
import com.girsang.stiker.service.StokService
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal

@Service
@Transactional
class DataPembelianService(
    private val repoPembelian: DataPembelianRepository,
    private val repoPembelianRinci: DataPembelianRinciRepository,
    private val repoBarang: DataBarangRepository,
    private val repoPengguna: DataPenggunaRepository,
    private val mapper: PembelianMapper,
    private val stokService: StokService
) {

    @Transactional(readOnly = true)
    fun semuaDataPembelian(): List<PembelianResponse> =
    repoPembelian.findAll().map { mapper.toResponse(it) }

    @Transactional(readOnly = true)
    fun semuaRinci(): List<PembelianRinciResponse> =
        repoPembelianRinci.findAll().map { mapper.toResponse(it) }

    @Transactional(readOnly = true)
    fun cariId(id: String): PembelianResponse {
        val entity = repoPembelian.findById(id)
            .orElseThrow { throw IllegalArgumentException("Data Pembelian dengan ID $id tidak ditemukan!!") }

        return mapper.toResponse(entity)
    }

    fun simpan(request: PembelianRequest): PembelianResponse {

        val pengguna = repoPengguna.findById(request.dataPenggunaId)
            .orElseThrow()

        val pembelian = DataPembelian(
            dataPengguna = pengguna,
            tanggal = System.currentTimeMillis(),
            subtotal = BigDecimal.ZERO
        )

        pembelian.rincian = request.rincian
            .map { buatRincian(pembelian, it) }
            .toMutableList()

        pembelian.subtotal = hitungSubtotal(pembelian.rincian)

        val hasil = repoPembelian.save(pembelian)

        hasil.rincian.forEach {
            stokService.tambahStok(
                barangId = it.dataBarang.id,
                jumlah = it.jumlah,
                jenis = JenisRiwayatStok.PEMBELIAN,
                referensiId = it.id,
                pengguna = pengguna,
                keterangan = "Pembelian Barang"
            )
        }

        return mapper.toResponse(hasil)
    }

    fun ubah(id: String, request: PembelianRequest): PembelianResponse {

        val pembelian = repoPembelian.findById(id)
            .orElseThrow {
                IllegalArgumentException("Pembelian tidak ditemukan")
            }

        val pengguna = repoPengguna.findById(request.dataPenggunaId)
            .orElseThrow {
                IllegalArgumentException("Pengguna tidak ditemukan")
            }

        // Kembalikan stok lama
        pembelian.rincian.forEach {
            stokService.hapusStok(
                referensiId = it.id,
                barangId = it.dataBarang.id
            )
        }

        pembelian.rincian.clear()


        val rincianBaru = request.rincian.map {
            buatRincian(pembelian, it)
        }

        pembelian.dataPengguna = pengguna
        pembelian.rincian.addAll(rincianBaru)

        pembelian.subtotal = hitungSubtotal(pembelian.rincian)

        val hasil = repoPembelian.save(pembelian)

        hasil.rincian.forEach {
            stokService.tambahStok(
                barangId = it.dataBarang.id,
                jumlah = it.jumlah,
                jenis = JenisRiwayatStok.PEMBELIAN,
                referensiId = it.id,
                pengguna = pengguna,
                keterangan = "Pembelian Barang"
            )
        }

        return mapper.toResponse(hasil)
    }

    fun hapus(id: String) {

        val pembelian = repoPembelian.findById(id)
            .orElseThrow {
                IllegalArgumentException("Pembelian tidak ditemukan")
            }

        // Kurangi stok terlebih dahulu
        pembelian.rincian.forEach {
            stokService.hapusStok(
                referensiId = it.id,
                barangId = it.dataBarang.id
            )
        }

        repoPembelian.deleteById(id)
    }

    private fun buatRincian(
        pembelian: DataPembelian,
        request: PembelianRinciRequest
    ): DataPembelianRinci {

        val barang = repoBarang.findById(request.dataBarangId)
            .orElseThrow {
                IllegalArgumentException("Barang dengan ID ${request.dataBarangId} tidak ditemukan")
            }

        val total = request.harga.multiply(BigDecimal.valueOf(request.jumlah))

        return DataPembelianRinci(
            id = "",
            dataPembelian = pembelian,
            dataBarang = barang,
            harga = request.harga,
            jumlah = request.jumlah,
            total = total
        )
    }

    private fun hitungSubtotal(
        rincian: List<DataPembelianRinci>
    ): BigDecimal {

        return rincian.fold(BigDecimal.ZERO) { subtotal, item ->
            subtotal.add(item.total)
        }

    }
}