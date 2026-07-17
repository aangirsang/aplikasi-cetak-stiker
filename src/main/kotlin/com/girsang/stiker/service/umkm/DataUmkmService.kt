package com.girsang.stiker.service.umkm

import com.girsang.stiker.model.mapper.DataUmkmMapper
import com.girsang.stiker.model.dto.request.DataUmkmRequest
import com.girsang.stiker.model.dto.response.DataUmkmResponse
import com.girsang.stiker.model.entity.DataUmkm
import com.girsang.stiker.repository.DataKategoriRepository
import com.girsang.stiker.repository.DataUmkmRepository
import com.girsang.stiker.service.EntityDeletionService
import org.springframework.stereotype.Service

@Service
class DataUmkmService(
    private val repo: DataUmkmRepository,
    private val repoKategori: DataKategoriRepository,
    private val mapper: DataUmkmMapper,
    private val deletionService: EntityDeletionService
) {
    fun semua(): List<DataUmkmResponse> =
        repo.findAll().map { mapper.toResponse(it) }

    fun semuaAktif(): List<DataUmkmResponse> =
        repo.findAllByStatusTrue()
            .map { mapper.toResponse(it) }

    fun semuaPunyaStiker(): List<DataUmkmResponse> =
        repo.findUmkmWithStiker()
            .map { mapper.toResponse(it) }

    fun cariById(id: String): DataUmkmResponse {
        val data = repo.findById(id).orElseThrow { NoSuchElementException("UMKM tidak ditemukan") }
        return mapper.toResponse(data)
    }

    fun cariUMKM(namaPemilikUmkm: String?, namaUmkm: String?, alamat: String?): List<DataUmkm>{
        val namaPemilikUmkm = namaPemilikUmkm?.trim()?.takeIf { it.isNotEmpty() }
        val namaUmkm = namaUmkm?.trim()?.takeIf { it.isNotEmpty() }
        val alamat = alamat?.trim()?.takeIf { it.isNotEmpty() }

        return repo.cariUMKM(namaPemilikUmkm, namaUmkm, alamat)
    }

    fun simpan(request: DataUmkmRequest): DataUmkmResponse {
        if (repo.existsByEmail(request.email)) throw IllegalArgumentException("Email sudah digunakan")
        if (repo.existsByNoKtp(request.noKtp)) throw IllegalArgumentException("Nomor KTP sudah digunakan")

        val kategori = repoKategori.findById(request.dataKategoriId).orElseThrow()

        val umkm = DataUmkm(
            namaUsaha = request.namaUsaha,
            namaPemilik = request.namaPemilik,
            dataKategori = kategori,
            deskripsi = request.deskripsi,
            noKtp = request.noKtp,
            jenisKelamin = request.jenisKelamin,
            tglLahir = request.tglLahir,
            noTelpon = request.noTelpon,
            email = request.email,
            alamat = request.alamat,
            whatsapp = request.whatsapp,
            instagram = request.instagram,
            facebook = request.facebook,
            tiktok = request.tiktok,
            status = request.status,
            tglRegistrasi = System.currentTimeMillis()
        )
        val saved = repo.save(umkm)
        return mapper.toResponse(saved)
    }

    fun ubah(id: String, request: DataUmkmRequest): DataUmkmResponse {
        val lama = repo.findById(id).orElseThrow { NoSuchElementException("Data tidak ditemukan") }
        val kategori = repoKategori.findById(request.dataKategoriId).orElseThrow()

        lama.apply {
            lama.namaUsaha = request.namaUsaha
            lama.namaPemilik = request.namaPemilik
            lama.dataKategori = kategori
            lama.deskripsi = request.deskripsi
            lama.noKtp = request.noKtp
            lama.jenisKelamin = request.jenisKelamin
            lama.tglLahir = request.tglLahir
            lama.noTelpon = request.noTelpon
            lama.email = request.email
            lama.alamat = request.alamat
            lama.whatsapp = request.whatsapp
            lama.instagram = request.instagram
            lama.facebook = request.facebook
            lama.tiktok = request.tiktok
            lama.status = request.status
            lama.tglRegistrasi = request.tglRegistrasi
        }


        val update = repo.save(lama)
        return mapper.toResponse(update)
    }

    fun hapus(id: String) {
        if (!repo.existsById(id)) throw NoSuchElementException("Data tidak ditemukan")
        deletionService.safeDelete(DataUmkm::class.java, id)
    }
}