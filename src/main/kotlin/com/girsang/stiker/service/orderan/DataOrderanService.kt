package com.girsang.stiker.service.orderan

import com.girsang.stiker.config.JenisRiwayatStok
import com.girsang.stiker.model.dto.request.DataOrderanRequest
import com.girsang.stiker.model.dto.request.DataOrderanRinciRequest
import com.girsang.stiker.model.dto.response.DataOrderanResponse
import com.girsang.stiker.model.dto.response.DataOrderanRinciResponse
import com.girsang.stiker.model.entity.DataOrderan
import com.girsang.stiker.model.entity.DataOrderanRinci
import com.girsang.stiker.model.mapper.DataOrderanMapper
import com.girsang.stiker.repository.DataOrderanRepository
import com.girsang.stiker.repository.DataOrderanRinciRepository
import com.girsang.stiker.repository.DataPenggunaRepository
import com.girsang.stiker.repository.DataStikerRepository
import com.girsang.stiker.repository.DataUmkmRepository
import com.girsang.stiker.service.persediaan.StokService
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.format.DateTimeFormatter

@Service
@Transactional
class DataOrderanService(
    private val repoOrder: DataOrderanRepository,
    private val repoRinci: DataOrderanRinciRepository,
    private val repoStiker: DataStikerRepository,
    private val repoPengguna: DataPenggunaRepository,
    private val repoUmkm: DataUmkmRepository,
    private val mapper: DataOrderanMapper,
    private val stokService: StokService
) {

    @Transactional(readOnly = true)
    fun semuaOrderan(): List<DataOrderanResponse> =
        repoOrder.findAll().map { mapper.toResponse(it) }

    @Transactional(readOnly = true)
    fun semuaRinci(): List<DataOrderanRinciResponse> =
        repoRinci.findAll().map { mapper.toResponse(it) }

    @Transactional(readOnly = true)
    fun cariId(id: String): DataOrderanResponse {
        val entity = repoOrder.findById(id)
            .orElseThrow { throw IllegalArgumentException("Data Orderan dengan ID $id tidak ditemukan!!") }

        return mapper.toResponse(entity)
    }

    fun simpan(request: DataOrderanRequest): DataOrderanResponse {

        val pengguna = repoPengguna.findById(request.dataPenggunaId)
            .orElseThrow { throw IllegalArgumentException("Data Pengguna dengan ID ${request.dataPenggunaId} tidak ditemukan!!") }

        val umkm = repoUmkm.findById(request.dataUmkmId)
            .orElseThrow { throw IllegalArgumentException("Data Umkm dengan ID ${request.dataUmkmId} tidak ditemukan!!") }

        val orderan = DataOrderan(
            dataPengguna = pengguna,
            dataUMKM = umkm,
            faktur = generateFaktur(),
            tanggal = System.currentTimeMillis(),
            totalStiker = 0
        )

        orderan.rincian = request.rincian
            .map { buatRincian(orderan, it) }
            .toMutableList()

        orderan.totalStiker = hitungStiker(orderan.rincian)

        val simpan = repoOrder.save(orderan)

        simpan.rincian.forEach {
            stokService.tambahStok(
                barangId = it.dataStiker.dataBarang.id,
                jumlah = it.jumlah.toLong(),
                jenis = JenisRiwayatStok.ORDER,
                referensiId = it.id,
                pengguna = pengguna,
                keterangan = "Order Stiker ${it.dataStiker.namaStiker}"
            )
        }
        
        return mapper.toResponse(simpan)
    }

    fun ubah(id: String, request: DataOrderanRequest): DataOrderanResponse {

        val orderan = repoOrder.findById(id)
            .orElseThrow {
                IllegalArgumentException("Orderan tidak ditemukan")
            }

        val pengguna = repoPengguna.findById(request.dataPenggunaId)
            .orElseThrow {
                IllegalArgumentException("Pengguna tidak ditemukan")
            }


        val umkm = repoUmkm.findById(request.dataUmkmId)
            .orElseThrow { throw IllegalArgumentException("Data Umkm dengan ID ${request.dataUmkmId} tidak ditemukan!!") }

        // Kembalikan stok lama
        orderan.rincian.forEach {
            stokService.hapusStok(
                referensiId = it.id,
                barangId = it.dataStiker.dataBarang.id
            )
        }

        orderan.rincian.clear()


        orderan.dataPengguna = pengguna
        orderan.dataUMKM = umkm

        orderan.rincian = request.rincian
            .map { buatRincian(orderan, it) }
            .toMutableList()

        orderan.totalStiker = hitungStiker(orderan.rincian)

        val simpan = repoOrder.save(orderan)

        simpan.rincian.forEach {
            stokService.tambahStok(
                barangId = it.dataStiker.dataBarang.id,
                jumlah = it.jumlah.toLong(),
                jenis = JenisRiwayatStok.ORDER,
                referensiId = it.id,
                pengguna = pengguna,
                keterangan = "Order Stiker ${it.dataStiker.namaStiker}"
            )
        }

        return mapper.toResponse(simpan)
    }

    fun hapus(id: String) {

        val orderan = repoOrder.findById(id)
            .orElseThrow {
                IllegalArgumentException("Orderan tidak ditemukan")
            }

        orderan.rincian.forEach {
            stokService.hapusStok(
                referensiId = it.id,
                barangId = it.dataStiker.dataBarang.id
            )
        }

        repoOrder.deleteById(id)
    }

    private fun buatRincian(
        orderan: DataOrderan,
        request: DataOrderanRinciRequest
    ): DataOrderanRinci {
        val stiker = repoStiker.findById(request.dataStikerId)
            .orElseThrow { throw IllegalArgumentException("Data Stiker dengan ID ${request.dataStikerId} tidak ditemukan!!") }

        return DataOrderanRinci(
            id = "",
            dataOrderan = orderan,
            dataStiker = stiker,
            jumlah = request.jumlah
        )
    }

    private fun hitungStiker(
        rincian: List<DataOrderanRinci>
    ): Int {
        return rincian.sumOf { it.jumlah }
    }

    fun generateFaktur(): String {

        val periode = LocalDate.now()
            .format(DateTimeFormatter.ofPattern("yyMM"))

        val prefix = "RBBB-$periode"

        val last =
            repoOrder
                .findTopByFakturStartingWithOrderByFakturDesc(prefix)

        val nomor = if (last == null) {
            1
        } else {
            last.faktur
                .removePrefix(prefix)
                .toInt() + 1
        }

        return "$prefix${nomor.toString().padStart(4, '0')}"
    }
}