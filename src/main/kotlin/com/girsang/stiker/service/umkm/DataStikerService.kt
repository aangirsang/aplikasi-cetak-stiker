package com.girsang.stiker.service.umkm


import com.girsang.stiker.model.mapper.DataUmkmMapper
import com.girsang.stiker.model.dto.request.DataStikerRequest
import com.girsang.stiker.model.dto.response.DataStikerResponse
import com.girsang.stiker.model.entity.DataLayoutCetak
import com.girsang.stiker.model.entity.DataStiker
import com.girsang.stiker.repository.DataBarangRepository
import com.girsang.stiker.repository.DataLayoutCetakRepository
import com.girsang.stiker.repository.DataStikerRepository
import com.girsang.stiker.repository.DataUmkmRepository
import com.girsang.stiker.service.EntityDeletionService
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
class DataStikerService(
    private val repoStiker: DataStikerRepository,
    private val repoLayout: DataLayoutCetakRepository,
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
        println(request)
        println("pathCDR = ${request.pathTIF}")


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

        if(request.imageWidthMM>0 &&
            request.imageHeightMM>0){
            simpanLayout(stiker, request)
        }


        val simpan = repoStiker.save(stiker)


        // 🔹 Kembalikan DTO sebagai response

        return mapper.toResponse(simpan)
    }

    fun ubah(id: String, request: DataStikerRequest): DataStikerResponse {
        println("       Data Request: $request")
        val stiker = repoStiker.findById(id).orElseThrow { NoSuchElementException("Stiker tidak ditemukan") }

        val layout = repoLayout.findByDataStikerId(stiker.id)

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

        if(request.imageWidthMM>0 &&
            request.imageHeightMM>0){
            if(layout == null){
                println("       SIMPAN BARU: ${stiker.namaStiker}")
                simpanLayout(stiker, request)
            } else {

                println("       SIMPAN UBAHAN: ${stiker.namaStiker}")
                ubahLayout(stiker, layout, request)
            }
        }

        val updated = repoStiker.save(stiker)

        return mapper.toResponse(updated)
    }

    fun hapus(id: String) {
        if (!repoStiker.existsById(id)) throw NoSuchElementException("Data tidak ditemukan")
        deletionService.safeDelete(DataStiker::class.java, id)
    }

    fun hapusLayout(id: String) {
        if(!repoLayout.existsById(id)) throw NoSuchElementException("Data tidak ditemukan")
        repoLayout.deleteById(id)
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

    fun simpanLayout(stiker: DataStiker, request: DataStikerRequest) {
        println("           === MASUK SIMPAN LAYOUT ===")
        val layout = DataLayoutCetak(
            dataStiker = stiker,
            pathTIF = request.pathTIF,
            kertas = request.kertas,
            lebarKertas = request.lebarKertas,
            tinggiKertas = request.tinggiKertas,
            offsetX = request.offsetX,
            offsetY = request.offsetY,
            width = request.width,
            height = request.height,
            dpiX = request.dpiX,
            dpiY = request.dpiY,
            imageWidthMM = request.imageWidthMM,
            imageHeightMM = request.imageHeightMM,
            dibuatPada = System.currentTimeMillis(),
            diubahPada = System.currentTimeMillis()
        )
        stiker.layoutCetak = layout
        println("           === SELESAI SIMPAN LAYOUT ===")
    }

    fun ubahLayout(stiker: DataStiker, layout: DataLayoutCetak, request: DataStikerRequest) {
        layout.apply {
            layout.pathTIF = request.pathTIF
            layout.kertas = request.kertas
            layout.lebarKertas = request.lebarKertas
            layout.tinggiKertas = request.tinggiKertas
            layout.offsetX = request.offsetX
            layout.offsetY = request.offsetY
            layout.width = request.width
            layout.height = request.height
            layout.dpiX = request.dpiX
            layout.dpiY = request.dpiY
            layout.imageWidthMM = request.imageWidthMM
            layout.imageHeightMM = request.imageHeightMM
            layout.diubahPada = System.currentTimeMillis()
        }
        stiker.layoutCetak = layout
    }

}