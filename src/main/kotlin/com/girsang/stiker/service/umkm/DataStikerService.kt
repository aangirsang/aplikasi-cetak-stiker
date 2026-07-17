package com.girsang.stiker.service.umkm


import com.girsang.stiker.model.mapper.DataUmkmMapper
import com.girsang.stiker.model.dto.request.DataStikerRequest
import com.girsang.stiker.model.dto.response.DataStikerResponse
import com.girsang.stiker.model.entity.DataBarang
import com.girsang.stiker.model.entity.DataStiker
import com.girsang.stiker.repository.DataBarangRepository
import com.girsang.stiker.repository.DataStikerRepository
import com.girsang.stiker.repository.DataUmkmRepository
import com.girsang.stiker.service.EntityDeletionService
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
class DataStikerService(
    private val repoStiker: DataStikerRepository,
    private val repoUmkm: DataUmkmRepository,
    private val repoBarang: DataBarangRepository,
    private val mapper: DataUmkmMapper,
    private val deletionService: EntityDeletionService
) {

    fun semua(): List<DataStikerResponse> =
        repoStiker.findAll().map { mapper.toResponse(it) }

    fun cariById(id: String): DataStikerResponse {
        val stiker = repoStiker.findById(id).orElseThrow { NoSuchElementException("Stiker tidak ditemukan") }
        return mapper.toResponse(stiker)
    }

    fun cariByUMKM(umkmId: String): List<DataStikerResponse> {
        val daftar = repoStiker.findByDataUmkmId(umkmId)
        return daftar.map { mapper.toResponse(it) }
    }

fun cariByumkmDanStatus(umkmId: String): List<DataStikerResponse> {
        val daftar = repoStiker.findByUmkmIdAndStatusTrue(umkmId)
        return daftar.map { mapper.toResponse(it) }
    }

    fun simpan(request: DataStikerRequest): DataStikerResponse {

        val barang = repoBarang.findById(request.barangId)
            .orElseThrow { throw IllegalArgumentException("Data Barang dengan ID ${request.barangId} tidak ditemukan!!") }


        // 🔹 Ambil entity DataUmkm dari database
        val umkmEntity = repoUmkm.findById(request.umkmId)
            .orElseThrow{
                IllegalArgumentException(
                    "Data UMKM dengan ID ${request.umkmId} tidak ditemukan"
                )
            }

        // 🔹 Generate kode otomatis
        val tahunShort = LocalDate.now().year % 100
        val kode = generateKodeStiker(umkmEntity.namaUsaha, tahunShort)

        // 🔹 Buat entity DataStiker dari DTO
        val stiker = DataStiker(
            dataUmkm = umkmEntity,
            kodeStiker = kode,
            namaStiker = request.namaStiker,
            panjang = request.panjang,
            lebar = request.lebar,
            catatan = request.catatan,
            status = request.status,
            pathGambar1 = request.pathGambar1,
            pathGambar2 = request.pathGambar2,
            dataBarang = barang
        )

        val simpan = repoStiker.save(stiker)

        // 🔹 Kembalikan DTO sebagai response

        return mapper.toResponse(simpan)
    }

    fun ubah(id: String, request: DataStikerRequest): DataStikerResponse {
        val stiker = repoStiker.findById(id).orElseThrow { NoSuchElementException("Stiker tidak ditemukan") }

        val barang = repoBarang.findById(request.barangId)
            .orElseThrow { throw IllegalArgumentException("Data Barang dengan ID ${request.barangId} tidak ditemukan!!") }


        val umkmEntity = repoUmkm.findById(request.umkmId)
            .orElseThrow{
                IllegalArgumentException(
                    "Data UMKM dengan ID ${request.umkmId} tidak ditemukan"
                )
            }

        stiker.apply {
            stiker.dataUmkm = umkmEntity
            stiker.namaStiker = request.namaStiker
            stiker.panjang = request.panjang
            stiker.lebar = request.lebar
            stiker.catatan = request.catatan
            stiker.status = request.status
            stiker.pathGambar1 = request.pathGambar1
            stiker.pathGambar2 = request.pathGambar2
            stiker.dataBarang = barang
        }



        val updated = repoStiker.save(stiker)
        return mapper.toResponse(updated)
    }

    fun hapus(id: String) {
        if (!repoStiker.existsById(id)) throw NoSuchElementException("Data tidak ditemukan")
        deletionService.safeDelete(DataStiker::class.java, id)
    }

    private fun generateKodeStiker(namaUMKM: String, tahun: Int): String {
        val nama = namaUMKM.trim()
        val tahunStr = tahun.toString().takeLast(2)

        // Ambil kode terbaru berdasarkan UMKM & Tahun
        val lastKode = repoStiker.findLastKodeByUmkmAndYear(nama, tahunStr).firstOrNull()
            ?.kodeStiker ?: ""

        val nomorBaru = if (lastKode.isBlank()) {
            1
        } else {
            // Ambil 2 digit terakhir sebagai nomor urut
            val nomor = lastKode.takeLast(2).toIntOrNull() ?: 0
            nomor + 1
        }

        val nomorStr = nomorBaru.toString().padStart(2, '0')
        return "$nama-$tahunStr$nomorStr"
    }


    fun getKodeStikerBerikutnya(umkmId: String): String {
        val umkm = repoUmkm.findById(umkmId)
            .orElseThrow { NoSuchElementException("UMKM tidak ditemukan") }
        val tahunShort = LocalDate.now().year % 100
        return generateKodeStiker(umkm.namaUsaha, tahunShort)
    }

    fun cariStiker(namaStiker: String?, namaUsaha: String?): List<DataStiker> {
        val keyStiker = namaStiker?.trim()?.takeIf { it.isNotEmpty() }
        val keyUmkm = namaUsaha?.trim()?.takeIf { it.isNotEmpty() }

        return repoStiker.cariStiker(keyStiker, keyUmkm)
    }
}