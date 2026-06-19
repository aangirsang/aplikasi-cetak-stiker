package com.girsang.stiker.service

import com.girsang.stiker.model.dto.DataUMKMDTO
import com.girsang.stiker.model.entity.DataUmkm
import com.girsang.stiker.repository.DataUmkmRepository
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Service
import org.springframework.web.bind.annotation.RequestBody

@Service
class DataUmkmService(
    private val repo: DataUmkmRepository,
    private val deletionService: EntityDeletionService
) {
    fun semua(): List<DataUMKMDTO> =
        repo.findAll().map { DataUMKMDTO.fromEntity(it) }

    fun semuaAktif(): List<DataUMKMDTO> =
        repo.findAllByStatusTrue()
            .map { DataUMKMDTO.fromEntity(it) }

    fun semuaPunyaStiker(): List<DataUMKMDTO> =
        repo.findUmkmWithStiker()
            .map { DataUMKMDTO.fromEntity(it) }

    fun cariById(id: Long): DataUMKMDTO {
        val data = repo.findById(id).orElseThrow { NoSuchElementException("UMKM tidak ditemukan") }
        return DataUMKMDTO.fromEntity(data)
    }

    fun cariUMKM(namaPemilikUmkm: String?, namaUmkm: String?, alamat: String?): List<DataUmkm>{
        val namaPemilikUmkm = namaPemilikUmkm?.trim()?.takeIf { it.isNotEmpty() }
        val namaUmkm = namaUmkm?.trim()?.takeIf { it.isNotEmpty() }
        val alamat = alamat?.trim()?.takeIf { it.isNotEmpty() }

        return repo.cariUMKM(namaPemilikUmkm, namaUmkm, alamat)
    }

    fun simpan(@RequestBody dto: DataUMKMDTO): ResponseEntity<DataUmkm> {
        if (repo.existsByEmail(dto.email)) throw IllegalArgumentException("Email sudah digunakan")
        if (repo.existsByNoKtp(dto.noKtp)) throw IllegalArgumentException("Nomor KTP sudah digunakan")

        val umkm = DataUmkm(
            namaUsaha = dto.namaUsaha,
            namaPemilik = dto.namaPemilik,
            dataKategori = dto.dataKategori,
            deskripsi = dto.deskripsi,
            noKtp = dto.noKtp,
            jenisKelamin = dto.jenisKelamin,
            tglLahir = dto.tglLahir,
            noTelpon = dto.noTelpon,
            email = dto.email,
            alamat = dto.alamat,
            whatsapp = dto.whatsapp,
            instagram = dto.instagram,
            facebook = dto.facebook,
            tiktok = dto.tiktok,
            status = dto.status,
            tglRegistrasi = System.currentTimeMillis()
        )
        val saved = repo.save(umkm)
        return ResponseEntity.ok(saved)
    }

    fun ubah(id: Long, @RequestBody dto: DataUMKMDTO): ResponseEntity<DataUmkm> {
        val lama = repo.findById(id).orElseThrow { NoSuchElementException("Data tidak ditemukan") }

        lama.apply {
            lama.namaUsaha = dto.namaUsaha
            lama.namaPemilik = dto.namaPemilik
            lama.dataKategori = dto.dataKategori
            lama.deskripsi = dto.deskripsi
            lama.noKtp = dto.noKtp
            lama.jenisKelamin = dto.jenisKelamin
            lama.tglLahir = dto.tglLahir
            lama.noTelpon = dto.noTelpon
            lama.email = dto.email
            lama.alamat = dto.alamat
            lama.whatsapp = dto.whatsapp
            lama.instagram = dto.instagram
            lama.facebook = dto.facebook
            lama.tiktok = dto.tiktok
            lama.status = dto.status
            lama.tglRegistrasi = dto.tglRegistrasi
        }


        val update = repo.save(lama)
        return ResponseEntity.ok(update)
    }

    fun hapus(id: Long) {
        if (!repo.existsById(id)) throw NoSuchElementException("Data tidak ditemukan")
        deletionService.safeDelete(DataUmkm::class.java, id)
    }
}